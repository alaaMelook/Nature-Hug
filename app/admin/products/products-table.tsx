"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Upload,
  Calculator,
  Beaker,
  AlertTriangle,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Category = {
  id: number;
  name_english: string;
  name_arabic: string | null;
};

export default function ProductsTable({
  categories,
}: {
  categories: Category[];
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [search, setSearch] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name_english: "",
    name_arabic: "",
    description_english: "",
    description_arabic: "",
    price: "",
    discount: "",
    stock: "",
    category_id: categories[0]?.id?.toString() || "",
    image_url: "",
    skin_type: "",
    sizes: "",
    status: "active" as "active" | "inactive",
    slug: "",
    meta_description: "",
  });

  const [productMaterials, setProductMaterials] = useState<
    { material_id: number; grams_used: number }[]
  >([]);
  const [totalCost, setTotalCost] = useState(0);
  const [profit, setProfit] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [productYield, setProductYield] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch materials
  const fetchMaterials = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching materials:", error);
        return;
      }

      setMaterials((data as Material[]) || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  }, []);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching products...");
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          materials:product_materials(
            id,
            grams_used,
            material:materials(*)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching products:", error);
        alert(`Error fetching products: ${error.message}`);
        return;
      }

      console.log(
        "✅ Products fetched successfully:",
        data?.length || 0,
        "products"
      );
      setProducts((data as Product[]) || []);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      alert(`Error fetching products: ${error}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
    fetchProducts();
  }, [fetchMaterials, fetchProducts]);

  // Calculate total cost, profit, and yield when materials or price change
  useEffect(() => {
    const cost = productMaterials.reduce((total, pm) => {
      const material = materials.find((m) => m.id === pm.material_id);
      return total + (material ? material.price_per_gram * pm.grams_used : 0);
    }, 0);

    setTotalCost(cost);

    const price = Number(formData.price) || 0;
    const profit = price - cost;
    setProfit(profit);

    // Calculate profit margin percentage
    const margin = price > 0 ? (profit / price) * 100 : 0;
    setProfitMargin(margin);

    // Calculate product yield (how many products can be made with current stock)
    if (productMaterials.length > 0) {
      const minYield = Math.min(
        ...productMaterials.map((pm) => {
          const material = materials.find((m) => m.id === pm.material_id);
          return material
            ? Math.floor(material.stock_grams / pm.grams_used)
            : 0;
        })
      );
      setProductYield(minYield);
    } else {
      setProductYield(0);
    }
  }, [productMaterials, materials, formData.price]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name_english: "",
      name_arabic: "",
      description_english: "",
      description_arabic: "",
      price: "",
      discount: "",
      stock: "",
      category_id: categories[0]?.id?.toString() || "",
      image_url: "",
      skin_type: "",
      sizes: "",
      status: "active",
      slug: "",
      meta_description: "",
    });
    setProductMaterials([]);
    setImageFile(null);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    console.log("📝 Opening edit modal for product:", product);
    setEditingProduct(product);
    setFormData({
      name_english: product.name_english || "",
      name_arabic: product.name_arabic || "",
      description_english: product.description_english || "",
      description_arabic: product.description_arabic || "",
      price: product.price?.toString() || "",
      discount: product.discount?.toString() || "",
      stock: product.stock?.toString() || "",
      category_id: product.category_id?.toString() || "",
      image_url: product.image_url || "",
      skin_type: product.skin_type || "",
      sizes: product.sizes || "",
      status: product.status || "active",
      slug: product.slug || "",
      meta_description: product.meta_description || "",
    });

    // Set product materials
    if (product.materials) {
      setProductMaterials(
        product.materials.map((pm) => ({
          material_id: pm.material.id,
          grams_used: pm.grams_used,
        }))
      );
    } else {
      setProductMaterials([]);
    }

    setImageFile(null);
    setShowModal(true);
  };

  const addMaterial = () => {
    setProductMaterials([
      ...productMaterials,
      { material_id: 0, grams_used: 0 },
    ]);
  };

  const removeMaterial = (index: number) => {
    setProductMaterials(productMaterials.filter((_, i) => i !== index));
  };

  const updateMaterial = (
    index: number,
    field: "material_id" | "grams_used",
    value: number
  ) => {
    const updated = [...productMaterials];
    updated[index] = { ...updated[index], [field]: value };
    setProductMaterials(updated);
  };

  const uploadImageAndGetUrl = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExt}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (error) {
        throw new Error("Image upload failed: " + error.message);
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);
      return urlData?.publicUrl || "";
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (
      !formData.name_english ||
      !formData.price ||
      !formData.stock ||
      !formData.category_id
    ) {
      alert("Please fill all required fields (name, price, stock, category)");
      return;
    }

    if (Number(formData.price) < totalCost) {
      alert(
        `Price cannot be less than the total material cost (${totalCost.toFixed(
          2
        )} EGP)`
      );
      return;
    }

    setSaving(true);
    try {
      console.log("💾 Starting save operation...");
      console.log("📝 Editing product:", editingProduct?.id);
      console.log("�� Form data:", formData);

      let imageUrl = formData.image_url;
      if (imageFile) {
        console.log("📤 Uploading new image...");
        imageUrl = await uploadImageAndGetUrl(imageFile);
        console.log("✅ Image uploaded:", imageUrl);
      }

      const productData = {
        name_english: formData.name_english,
        name_arabic: formData.name_arabic,
        description_english: formData.description_english,
        description_arabic: formData.description_arabic,
        price: Number(formData.price),
        discount: formData.discount ? Number(formData.discount) : null,
        stock: Number(formData.stock),
        category_id: Number(formData.category_id),
        image_url: imageUrl,
        skin_type: formData.skin_type || null,
        sizes: formData.sizes || null,
        status: formData.status as "active" | "inactive",
        slug: formData.slug || null,
        meta_description: formData.meta_description || null,
      };

      console.log("📦 Product data to save:", productData);

      let result;
      if (editingProduct) {
        console.log("🔄 Updating existing product with ID:", editingProduct.id);
        result = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id)
          .select("*");

        // Update product materials
        if (result.data && result.data.length > 0) {
          // Delete existing materials
          await supabase
            .from("product_materials")
            .delete()
            .eq("product_id", editingProduct.id);

          // Insert new materials
          if (productMaterials.length > 0) {
            const materialsData = productMaterials
              .filter((pm) => pm.material_id > 0 && pm.grams_used > 0)
              .map((pm) => ({
                product_id: editingProduct.id,
                material_id: pm.material_id,
                grams_used: pm.grams_used,
              }));

            if (materialsData.length > 0) {
              await supabase.from("product_materials").insert(materialsData);
            }
          }
        }
      } else {
        console.log("➕ Creating new product");
        result = await supabase
          .from("products")
          .insert([productData])
          .select("*");

        // Add product materials
        if (result.data && result.data.length > 0) {
          const newProductId = result.data[0].id;
          const materialsData = productMaterials
            .filter((pm) => pm.material_id > 0 && pm.grams_used > 0)
            .map((pm) => ({
              product_id: newProductId,
              material_id: pm.material_id,
              grams_used: pm.grams_used,
            }));

          if (materialsData.length > 0) {
            await supabase.from("product_materials").insert(materialsData);
          }
        }
      }

      console.log("📊 Supabase result:", result);

      if (result.error) {
        console.error("❌ Supabase error:", result.error);
        throw new Error(result.error.message);
      }

      if (result.data && result.data.length > 0) {
        console.log("✅ Product saved successfully:", result.data[0]);
      } else {
        console.warn("⚠️ No data returned from save operation");
      }

      // Close modal and refresh data
      setShowModal(false);
      console.log("�� Refreshing products list...");
      await fetchProducts();

      // Show success message
      alert(
        editingProduct
          ? "Product updated successfully!"
          : "Product created successfully!"
      );
    } catch (error: any) {
      console.error("❌ Error saving product:", error);
      alert(`Error saving product: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف المنتج؟")) return;

    try {
      console.log("🗑️ Deleting product with ID:", id);

      // Delete product materials first
      await supabase.from("product_materials").delete().eq("product_id", id);

      // Delete product
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
      console.log("✅ Product deleted successfully");
      await fetchProducts();
    } catch (error: any) {
      console.error("❌ Error deleting product:", error);
      alert(error.message);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setFormData({ ...formData, image_url: "" });
    }
  };

  const filtered = products.filter((p) =>
    ((p.name_english || "") + " " + (p.name_arabic || ""))
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Products</h1>
        <button
          onClick={openAddModal}
          className="flex items-center px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 border border-gray-300 rounded-md w-full text-sm"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Image</th>
              <th className="px-4 py-2 text-left">Name (EN/AR)</th>
              <th className="px-4 py-2 text-left">Description (EN/AR)</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Cost</th>
              <th className="px-4 py-2 text-left">Profit</th>
              <th className="px-4 py-2 text-left">Discount</th>
              <th className="px-4 py-2 text-left">Stock</th>
              <th className="px-4 py-2 text-left">Skin Type</th>
              <th className="px-4 py-2 text-left">Sizes</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((p) => {
                const category = categories.find((c) => c.id === p.category_id);
                const productCost =
                  p.materials?.reduce(
                    (total, pm) =>
                      total + pm.material.price_per_gram * pm.grams_used,
                    0
                  ) || 0;
                const productProfit = p.price - productCost;

                return (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name_english}
                          className="h-10 w-10 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {p.name_english} / {p.name_arabic}
                    </td>
                    <td className="px-4 py-2">
                      {p.description_english} / {p.description_arabic}
                    </td>
                    <td className="px-4 py-2">
                      {category?.name_english || "—"}
                    </td>
                    <td className="px-4 py-2 font-semibold">{p.price} EGP</td>
                    <td className="px-4 py-2 text-red-600">
                      {productCost.toFixed(2)} EGP
                    </td>
                    <td
                      className={`px-4 py-2 font-semibold ${
                        productProfit >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {productProfit.toFixed(2)} EGP
                    </td>
                    <td className="px-4 py-2">{p.discount ?? "-"}</td>
                    <td className="px-4 py-2">{p.stock}</td>
                    <td className="px-4 py-2">{p.skin_type ?? "-"}</td>
                    <td className="px-4 py-2">{p.sizes ?? "-"}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          p.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit product"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={13}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Enhanced Modal with Detailed Material Analysis */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-6xl shadow-lg relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold mb-3">
                  Basic Information
                </h3>

                <input
                  type="text"
                  placeholder="Product name (English)"
                  value={formData.name_english}
                  onChange={(e) =>
                    setFormData({ ...formData, name_english: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Product name (Arabic)"
                  value={formData.name_arabic}
                  onChange={(e) =>
                    setFormData({ ...formData, name_arabic: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm"
                />
                <textarea
                  placeholder="Description (English)"
                  value={formData.description_english}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description_english: e.target.value,
                    })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm h-16"
                />
                <textarea
                  placeholder="Description (Arabic)"
                  value={formData.description_arabic}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description_arabic: e.target.value,
                    })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm h-16"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Price *"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded-md text-sm"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Stock *"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded-md text-sm"
                    required
                  />
                </div>

                <input
                  type="number"
                  placeholder="Discount"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm"
                />

                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_english}
                    </option>
                  ))}
                </select>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Product Image
                  </label>
                  {imageFile ? (
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      className="h-24 w-24 object-cover mb-2 rounded"
                    />
                  ) : formData.image_url ? (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="h-24 w-24 object-cover mb-2 rounded"
                    />
                  ) : null}
                  <div className="flex items-center space-x-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4 mr-2" /> Upload
                    </button>
                    {uploading && (
                      <span className="text-xs ml-2">Uploading...</span>
                    )}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Skin Type"
                  value={formData.skin_type}
                  onChange={(e) =>
                    setFormData({ ...formData, skin_type: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Sizes (comma separated)"
                  value={formData.sizes}
                  onChange={(e) =>
                    setFormData({ ...formData, sizes: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Slug (optional)"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm"
                />
                <textarea
                  placeholder="Meta description (SEO)"
                  value={formData.meta_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      meta_description: e.target.value,
                    })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm h-16"
                />
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "inactive",
                    })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Middle Column - Materials Selection */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Beaker className="h-5 w-5 mr-2" />
                  Materials & Consumption
                </h3>

                {/* Materials List */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium">
                      Materials Used
                    </label>
                    <button
                      type="button"
                      onClick={addMaterial}
                      className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Material
                    </button>
                  </div>

                  {/* Material Search */}
                  <div className="mb-3">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search materials..."
                        value={materialSearch}
                        onChange={(e) => setMaterialSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {productMaterials.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                      <Beaker className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No materials added yet</p>
                      <p className="text-xs text-gray-400">
                        Click "Add Material" to get started
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {productMaterials.map((pm, index) => {
                      const material = materials.find(
                        (m) => m.id === pm.material_id
                      );
                      const materialCost = material
                        ? material.price_per_gram * pm.grams_used
                        : 0;
                      const availableStock = material
                        ? material.stock_grams
                        : 0;
                      const canMake =
                        material && pm.grams_used > 0
                          ? Math.floor(availableStock / pm.grams_used)
                          : 0;
                      const stockPercentage =
                        material && availableStock > 0
                          ? (pm.grams_used / availableStock) * 100
                          : 0;

                      return (
                        <div
                          key={pm.material_id}
                          className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                        >
                          {/* Material Selection */}
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Material {""}
                                <select
                                  value={pm.material_id}
                                  onChange={(e) =>
                                    updateMaterial(
                                      index,
                                      "material_id",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value={0}>Select Material</option>
                                  {(() => {
                                    const filteredMaterials = materials.filter(
                                      (m) =>
                                        !productMaterials.some(
                                          (pm2, i) =>
                                            i !== index &&
                                            pm2.material_id === m.id
                                        ) &&
                                        m.name
                                          .toLowerCase()
                                          .includes(
                                            materialSearch.toLowerCase()
                                          )
                                    );

                                    if (
                                      filteredMaterials.length === 0 &&
                                      materialSearch
                                    ) {
                                      return (
                                        <option value={0} disabled>
                                          No materials found for "
                                          {materialSearch}"
                                        </option>
                                      );
                                    }

                                    return filteredMaterials.map((material) => (
                                      <option
                                        key={material.id}
                                        value={material.id}
                                      >
                                        {material.name} -{" "}
                                        {material.price_per_gram.toFixed(4)}{" "}
                                        EGP/g
                                      </option>
                                    ));
                                  })()}
                                </select>
                              </label>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeMaterial(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Remove material"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Grams Input */}
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Grams Used
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={pm.grams_used}
                                onChange={(e) =>
                                  updateMaterial(
                                    index,
                                    "grams_used",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="text-xs text-gray-500 pt-6">
                              grams
                            </div>
                          </div>

                          {/* Material Details */}
                          {material && pm.grams_used > 0 && (
                            <div className="bg-gray-50 p-3 rounded-md space-y-2">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Cost per product:
                                  </span>
                                  <span className="font-semibold text-red-600">
                                    {materialCost.toFixed(2)} EGP
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Available stock:
                                  </span>
                                  <span className="font-medium">
                                    {availableStock.toFixed(2)}g
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Can make:
                                  </span>
                                  <span
                                    className={`font-semibold ${
                                      canMake > 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {canMake} products
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Stock usage:
                                  </span>
                                  <span
                                    className={`font-medium ${
                                      stockPercentage > 10
                                        ? "text-orange-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {stockPercentage.toFixed(1)}%
                                  </span>
                                </div>
                              </div>

                              {/* Stock Warning */}
                              {stockPercentage > 10 && (
                                <div className="bg-orange-100 border border-orange-300 text-orange-700 px-2 py-1 rounded text-xs flex items-center">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  High stock usage - consider reducing amount
                                </div>
                              )}

                              {canMake === 0 && pm.grams_used > 0 && (
                                <div className="bg-red-100 border border-red-300 text-red-700 px-2 py-1 rounded text-xs flex items-center">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Insufficient stock to make any products
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column - Cost Analysis & Profit */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Cost Analysis & Profit
                </h3>

                {/* Cost Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg space-y-4 border">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Cost Analysis
                    </h4>
                    <p className="text-sm text-gray-600">Per product unit</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-md shadow-sm">
                      <span className="font-medium flex items-center text-gray-700">
                        <DollarSign className="h-4 w-4 mr-2 text-red-500" />
                        Material Cost:
                      </span>
                      <span className="text-red-600 font-bold text-xl">
                        {totalCost.toFixed(2)} EGP
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white rounded-md shadow-sm">
                      <span className="font-medium text-gray-700">
                        Selling Price:
                      </span>
                      <span className="text-blue-600 font-bold text-xl">
                        {Number(formData.price || 0).toFixed(2)} EGP
                      </span>
                    </div>

                    <div className="border-t-2 border-gray-200 pt-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-md shadow-sm mb-2">
                        <span className="font-semibold flex items-center text-gray-800">
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Net Profit:
                        </span>
                        <span
                          className={`font-bold text-2xl ${
                            profit >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {profit.toFixed(2)} EGP
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
                        <span className="text-sm font-medium text-gray-600">
                          Profit Margin:
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            profitMargin >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {profitMargin.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profit Status Indicator */}
                  <div
                    className={`p-3 rounded-md text-center ${
                      profit >= 0
                        ? "bg-green-100 border border-green-300 text-green-800"
                        : "bg-red-100 border border-red-300 text-red-800"
                    }`}
                  >
                    {profit >= 0 ? (
                      <div className="flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        <span className="font-semibold">
                          Profitable Product
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        <span className="font-semibold">
                          Loss-Making Product
                        </span>
                      </div>
                    )}
                  </div>

                  {profit < 0 && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-md">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            Price Below Cost
                          </p>
                          <p className="text-xs text-red-600">
                            Increase price by {Math.abs(profit).toFixed(2)} EGP
                            to break even
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Yield Analysis */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-5 rounded-lg border border-blue-200">
                  <h4 className="font-semibold mb-4 flex items-center text-blue-800">
                    <Beaker className="h-5 w-5 mr-2" />
                    Production Analysis
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">
                          Max Products from Stock:
                        </span>
                        <span
                          className={`font-bold text-lg ${
                            productYield > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {productYield} units
                        </span>
                      </div>
                      {productYield === 0 && productMaterials.length > 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          Insufficient material stock
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <div className="text-xs text-gray-600 mb-1">
                          Total Production Value
                        </div>
                        <div className="font-bold text-blue-600 text-lg">
                          {(productYield * Number(formData.price || 0)).toFixed(
                            2
                          )}{" "}
                          EGP
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <div className="text-xs text-gray-600 mb-1">
                          Total Production Cost
                        </div>
                        <div className="font-bold text-red-600 text-lg">
                          {(productYield * totalCost).toFixed(2)} EGP
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-md shadow-sm border-l-4 border-green-400">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">
                          Total Profit Potential:
                        </span>
                        <span
                          className={`font-bold text-2xl ${
                            productYield * profit >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {(productYield * profit).toFixed(2)} EGP
                        </span>
                      </div>
                      {productYield > 0 && (
                        <div className="text-sm text-gray-600 mt-1">
                          {productYield} units × {profit.toFixed(2)} EGP profit
                          per unit
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Material Consumption Breakdown */}
                {productMaterials.length > 0 && (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-5 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold mb-4 flex items-center text-yellow-800">
                      <Beaker className="h-5 w-5 mr-2" />
                      Material Consumption per Product
                    </h4>
                    <div className="space-y-2">
                      {productMaterials
                        .filter((pm) => pm.material_id > 0 && pm.grams_used > 0)
                        .map((pm, index) => {
                          const material = materials.find(
                            (m) => m.id === pm.material_id
                          );
                          if (!material) return null;

                          const materialCost =
                            material.price_per_gram * pm.grams_used;
                          const stockPercentage =
                            (pm.grams_used / material.stock_grams) * 100;

                          return (
                            <div
                              key={index}
                              className="bg-white p-3 rounded-md shadow-sm border-l-4 border-yellow-400"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-gray-800">
                                  {material.name}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {material.price_per_gram.toFixed(4)} EGP/g
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-3 text-sm">
                                <div>
                                  <div className="text-gray-600 text-xs">
                                    Grams Used
                                  </div>
                                  <div className="font-semibold text-lg">
                                    {pm.grams_used}g
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-600 text-xs">
                                    Cost
                                  </div>
                                  <div className="font-semibold text-red-600">
                                    {materialCost.toFixed(2)} EGP
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-600 text-xs">
                                    Stock Usage
                                  </div>
                                  <div
                                    className={`font-semibold ${
                                      stockPercentage > 10
                                        ? "text-orange-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {stockPercentage.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-md text-sm"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:opacity-50"
                disabled={uploading || saving || profit < 0}
              >
                {saving
                  ? "Saving..."
                  : editingProduct
                  ? "Update Product"
                  : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
