"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash2, Search, X, Package } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function MaterialsTable({ initialMaterials }: { initialMaterials: Material[] }) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price_per_gram: "",
    stock_grams: "",
  });

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching materials...");
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("❌ Error fetching materials:", error);
        alert(`Error fetching materials: ${error.message}`);
        return;
      }
      
      console.log("✅ Materials fetched successfully:", data?.length || 0, "materials");
      setMaterials(data as Material[] || []);
    } catch (error) {
      console.error("❌ Error fetching materials:", error);
      alert(`Error fetching materials: ${error}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchMaterials(); 
  }, [fetchMaterials]);

  const openAddModal = () => {
    setEditingMaterial(null);
    setFormData({
      name: "",
      price_per_gram: "",
      stock_grams: "",
    });
    setShowModal(true);
  };

  const openEditModal = (material: Material) => {
    console.log("📝 Opening edit modal for material:", material);
    setEditingMaterial(material);
    setFormData({
      name: material.name || "",
      price_per_gram: material.price_per_gram?.toString() || "",
      stock_grams: material.stock_grams?.toString() || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price_per_gram || !formData.stock_grams) {
      alert("Please fill all required fields (name, price per gram, stock grams)");
      return;
    }

    setSaving(true);
    try {
      console.log("💾 Starting save operation...");
      console.log("📝 Editing material:", editingMaterial?.id);
      console.log("📝 Form data:", formData);

      const supabase = createSupabaseBrowserClient();
      
      // Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("You must be logged in to perform this action");
      }
      console.log("✅ User authenticated:", user.email);

      const materialData = {
        name: formData.name,
        price_per_gram: Number(formData.price_per_gram),
        stock_grams: Number(formData.stock_grams),
      };

      console.log("📦 Material data to save:", materialData);

      let result;
      if (editingMaterial) {
        console.log("🔄 Updating existing material with ID:", editingMaterial.id);
        result = await supabase
          .from("materials")
          .update(materialData)
          .eq("id", editingMaterial.id)
          .select("*");
      } else {
        console.log("➕ Creating new material");
        result = await supabase
          .from("materials")
          .insert([materialData])
          .select("*");
      }

      console.log("📊 Supabase result:", result);

      if (result.error) {
        console.error("❌ Supabase error:", result.error);
        if (result.error.message.includes("row-level security")) {
          throw new Error("Permission denied. Please check your database policies or contact an administrator.");
        }
        throw new Error(result.error.message);
      }

      if (result.data && result.data.length > 0) {
        console.log("✅ Material saved successfully:", result.data[0]);
      } else {
        console.warn("⚠️ No data returned from save operation");
      }

      // Close modal and refresh data
      setShowModal(false);
      console.log("🔄 Refreshing materials list...");
      await fetchMaterials();
      
      // Show success message
      alert(editingMaterial ? "Material updated successfully!" : "Material created successfully!");
      
    } catch (error: any) {
      console.error("❌ Error saving material:", error);
      alert(`Error saving material: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    
    try {
      console.log("🗑️ Deleting material with ID:", id);
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("materials").delete().eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
      console.log("✅ Material deleted successfully");
      await fetchMaterials();
    } catch (error: any) {
      console.error("❌ Error deleting material:", error);
      alert(error.message);
    }
  };

  const filtered = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase())
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
        <h1 className="text-2xl font-bold">Materials</h1>
        <button
          onClick={openAddModal}
          className="flex items-center px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Material
        </button>
      </div>
      
      {/* Search */}
      <div className="flex items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 border border-gray-300 rounded-md w-full text-sm"
          />
        </div>
      </div>
      
      {/* Materials Table */}
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Material Name</th>
              <th className="px-4 py-2 text-left">Price per Gram</th>
              <th className="px-4 py-2 text-left">Stock (Grams)</th>
              <th className="px-4 py-2 text-left">Total Value</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((material) => (
                <tr key={material.id} className="border-t">
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-2" />
                      {material.name}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {material.price_per_gram.toFixed(4)} EGP/g
                  </td>
                  <td className="px-4 py-2">
                    {material.stock_grams.toFixed(2)} g
                  </td>
                  <td className="px-4 py-2 font-semibold">
                    {(material.price_per_gram * material.stock_grams).toFixed(2)} EGP
                  </td>
                  <td className="px-4 py-2">
                    {new Date(material.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(material)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit material"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete material"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No materials found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-md shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editingMaterial ? "Edit Material" : "Add Material"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Material Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Shea Butter, Coconut Oil"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price per Gram (EGP) *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="0.0000"
                  value={formData.price_per_gram}
                  onChange={(e) =>
                    setFormData({ ...formData, price_per_gram: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stock (Grams) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.stock_grams}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_grams: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm"
                  required
                />
              </div>
              
              {formData.price_per_gram && formData.stock_grams && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Total Value:</strong> {(Number(formData.price_per_gram) * Number(formData.stock_grams)).toFixed(2)} EGP
                  </p>
                </div>
              )}
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
                disabled={saving}
              >
                {saving ? "Saving..." : editingMaterial ? "Update Material" : "Create Material"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
