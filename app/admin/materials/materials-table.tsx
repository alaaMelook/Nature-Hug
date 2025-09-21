"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash2, Search, X, Package, AlertTriangle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Material, Unit, Supplier, MaterialFormData } from "./types";

export default function MaterialsTable({ initialMaterials, units, suppliers }: { initialMaterials: Material[]; units: Unit[]; suppliers: Supplier[] }) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<MaterialFormData>({
    name: "",
    sku: "",
    barcode: "",
    price_per_gram: "",
    stock_grams: "",
    unit_id: units[0]?.id?.toString() || "",
    supplier_id: suppliers[0]?.id?.toString() || "",
  });

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("materials")
      .select("*, unit:units(*), supplier:suppliers(id, name)")
      .order("created_at", { ascending: false });
    if (!error && data) setMaterials(data as Material[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const openAddModal = () => {
    setEditingMaterial(null);
    setFormData({
      name: "",
      sku: "",
      barcode: "",
      price_per_gram: "",
      stock_grams: "",
      unit_id: units[0]?.id?.toString() || "",
      supplier_id: suppliers[0]?.id?.toString() || "",
    });
    setShowModal(true);
  };

  const openEditModal = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name || "",
      sku: material.sku || "",
      barcode: material.barcode || "",
      price_per_gram: material.price_per_gram?.toString() || "",
      stock_grams: material.stock_grams?.toString() || "",
      unit_id: material.unit_id?.toString() || "",
      supplier_id: material.supplier_id?.toString() || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price_per_gram || !formData.stock_grams || !formData.unit_id) {
      alert("Please fill all required fields.");
      return;
    }
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const materialData = {
      name: formData.name,
      sku: formData.sku,
      barcode: formData.barcode,
      price_per_gram: Number(formData.price_per_gram),
      stock_grams: Number(formData.stock_grams),
      unit_id: Number(formData.unit_id),
      supplier_id: formData.supplier_id ? Number(formData.supplier_id) : null,
    };

    let result;
    if (editingMaterial) {
      result = await supabase
        .from("materials")
        .update(materialData)
        .eq("id", editingMaterial.id)
        .select("*");
    } else {
      result = await supabase
        .from("materials")
        .insert([materialData])
        .select("*");
    }

    if (result.error) {
      alert(result.error.message);
    } else {
      setShowModal(false);
      await fetchMaterials();
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (!error) await fetchMaterials();
  };

  const filtered = materials.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

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
      {/* Table */}
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">Barcode</th>
              <th className="px-4 py-2">Unit</th>
              <th className="px-4 py-2">Supplier</th>
              <th className="px-4 py-2">Price/Gram</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Total Value</th>
              <th className="px-4 py-2">Low Stock</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((material) => {
                const lowStock = material.low_stock_threshold !== undefined
                  && material.stock_grams < material.low_stock_threshold;
                return (
                  <tr key={material.id} className="border-t">
                    <td className="px-4 py-2 flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      {material.name}
                    </td>
                    <td className="px-4 py-2">{material.sku || "-"}</td>
                    <td className="px-4 py-2">{material.barcode || "-"}</td>
                    <td className="px-4 py-2">{material.unit?.name || units.find(u => u.id === material.unit_id)?.name || "-"}</td>
                    <td className="px-4 py-2">{material.supplier?.name || suppliers.find(s => s.id === material.supplier_id)?.name || "-"}</td>
                    <td className="px-4 py-2">{material.price_per_gram.toFixed(4)} EGP/g</td>
                    <td className="px-4 py-2">{material.stock_grams.toFixed(2)}</td>
                    <td className="px-4 py-2 font-semibold">{(material.price_per_gram * material.stock_grams).toFixed(2)} EGP</td>
                    <td className="px-4 py-2">
                      {lowStock ? (
                        <span className="flex gap-1 items-center text-red-600 font-bold">
                          <AlertTriangle className="h-4 w-4" />
                          Low
                        </span>
                      ) : (
                        <span className="text-green-600 font-bold">OK</span>
                      )}
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
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
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
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border px-3 py-2 rounded-md text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full border px-3 py-2 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Barcode</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full border px-3 py-2 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit *</label>
                <select
                  value={formData.unit_id}
                  onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                  className="w-full border px-3 py-2 rounded-md text-sm"
                  required
                >
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Supplier</label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  className="w-full border px-3 py-2 rounded-md text-sm"
                >
                  <option value="">----</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price per Gram (EGP) *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.price_per_gram}
                  onChange={(e) => setFormData({ ...formData, price_per_gram: e.target.value })}
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
                  value={formData.stock_grams}
                  onChange={(e) => setFormData({ ...formData, stock_grams: e.target.value })}
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
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md text-sm" disabled={saving}>
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:opacity-50" disabled={saving}>
                {saving ? "Saving..." : editingMaterial ? "Update Material" : "Create Material"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}