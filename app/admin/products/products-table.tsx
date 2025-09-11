"use client";
import { useEffect, useState, useRef } from "react";
import { Plus, Edit, Trash2, Search, X, Upload } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Product = {
  id: number;
  name_english: string;
  name_arabic: string;
  description_english: string;
  description_arabic: string;
  price: number;
  discount: number | null;
  image_url?: string;
  category_id: number;
  skin_type?: string;
  sizes?: string;
  status: "active" | "inactive";
  slug?: string;
  meta_description?: string;
  stock: number;
  created_at?: string;
};

type Category = {
  id: number;
  name_english: string;
  name_arabic: string | null;
};

export default function ProductsTable({ categories }: { categories: Category[] }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
    status: "active",
    slug: "",
    meta_description: "",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

const fetchProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (!error && data) setProducts(data as Product[]);
};
  useEffect(() => { fetchProducts(); }, []);

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
    setImageFile(null);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
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
    setImageFile(null);
    setShowModal(true);
  };

  const uploadImageAndGetUrl = async (file: File) => {
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });
    setUploading(false);
    if (error) {
      alert("Image upload failed: " + error.message);
      return "";
    }
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);
    return urlData?.publicUrl || "";
  };

const handleSave = async () => {
  if (!formData.name_english || !formData.price || !formData.stock || !formData.category_id) {
    alert("Please fill all required fields (name, price, stock, category)");
    return;
  }
  let imageUrl = formData.image_url;
  if (imageFile) imageUrl = await uploadImageAndGetUrl(imageFile);

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

  let error;
  if (editingProduct) {
    const { error: updateError } = await supabase
      .from("products")
      .update(productData)
      .eq("id", editingProduct.id);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from("products")
      .insert([productData]);
    error = insertError;
  }
  if (error) {
    alert(error.message);
    return;
  }
  setShowModal(false);
  await fetchProducts();
};

const handleDelete = async (id: number) => {
  if (!window.confirm("هل أنت متأكد من حذف المنتج؟")) return;
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    alert(error.message);
    return;
  }
  await fetchProducts();
};

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setFormData({ ...formData, image_url: "" });
    }
  };

  const filtered = products.filter(
    (p) =>
      ((p.name_english || "") + " " + (p.name_arabic || ""))
        .toLowerCase()
        .includes(search.toLowerCase())
  );

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
                return (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name_english}
                          className="h-10 w-10 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{p.name_english} / {p.name_arabic}</td>
                    <td className="px-4 py-2">{p.description_english} / {p.description_arabic}</td>
                    <td className="px-4 py-2">{category?.name_english || "—"}</td>
                    <td className="px-4 py-2">{p.price}</td>
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
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="px-4 py-6 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-2xl shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>
            <div className="space-y-3">
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
                  setFormData({ ...formData, description_english: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md text-sm h-16"
              />
              <textarea
                placeholder="Description (Arabic)"
                value={formData.description_arabic}
                onChange={(e) =>
                  setFormData({ ...formData, description_arabic: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md text-sm h-16"
              />

              <div className="grid grid-cols-3 gap-3">
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
                  placeholder="Discount"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm"
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
                  {uploading && <span className="text-xs ml-2">Uploading...</span>}
                </div>
              </div>
              <input
                type="text"
                placeholder="Skin Type (مثلاً: كل أنواع البشرة)"
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
                  setFormData({ ...formData, meta_description: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md text-sm h-16"
              />
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700"
                disabled={uploading}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  }
