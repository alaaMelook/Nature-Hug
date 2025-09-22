"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash2, X, Package, AlertTriangle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Material, Unit, Supplier, Category, MaterialFormData } from "./types";

export default function MaterialsTable({
  initialMaterials,
  units,
  suppliers,
  categories,
}: {
  initialMaterials: Material[];
  units: Unit[];
  suppliers: Supplier[];
  categories: Category[];
}) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>({
    name: "",
    price_per_gram: "",
    stock_grams: "",
    supplier_id: "",
    category_id: "",
    low_stock_threshold: "",
  });

  const fetchMaterials = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("materials")
      .select("*, supplier:suppliers(id, name)");
    if (data) setMaterials(data as Material[]);
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
      supplier_id: "",
      category_id: "",
      low_stock_threshold: "",
    });
    setShowModal(true);
  };

  const openEditModal = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      price_per_gram: String(material.price_per_gram),
      stock_grams: String(material.stock_grams),
      supplier_id: material.supplier_id?.toString() || "",
      category_id: material.category_id?.toString() || "",
      low_stock_threshold: material.low_stock_threshold?.toString() || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const supabase = createSupabaseBrowserClient();
    const materialData = {
      name: formData.name,
      price_per_gram: Number(formData.price_per_gram),
      stock_grams: Number(formData.stock_grams),
      supplier_id: formData.supplier_id ? Number(formData.supplier_id) : null,
      category_id: formData.category_id ? Number(formData.category_id) : null,
      low_stock_threshold: formData.low_stock_threshold ? Number(formData.low_stock_threshold) : null,
    };

    let result;
    if (editingMaterial) {
      result = await supabase.from("materials").update(materialData).eq("id", editingMaterial.id);
    } else {
      result = await supabase.from("materials").insert([materialData]);
    }

    if (!result.error) {
      setShowModal(false);
      fetchMaterials();
    } else {
      alert(result.error.message);
    }
  };

  const handleDelete = async (id: number) => {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("materials").delete().eq("id", id);
    fetchMaterials();
  };

  return (
    <div>
      <button onClick={openAddModal} className="px-3 py-2 bg-primary-600 text-white rounded">
        <Plus className="h-4 w-4 mr-1" /> Add Material
      </button>

      <table className="min-w-full text-sm mt-4 border border-gray-300 border-collapse">
  <thead>
    <tr className="bg-gray-100 text-gray-700">
      <th className="px-4 py-2 border border-gray-300 text-left">Name</th>
      <th className="px-4 py-2 border border-gray-300 text-left">Supplier</th>
      <th className="px-4 py-2 border border-gray-300 text-left">Category</th>
      <th className="px-4 py-2 border border-gray-300 text-right">Price/g</th>
      <th className="px-4 py-2 border border-gray-300 text-right">Stock</th>
      <th className="px-4 py-2 border border-gray-300 text-right">Threshold</th>
      <th className="px-4 py-2 border border-gray-300 text-center">Status</th>
      <th className="px-4 py-2 border border-gray-300 text-center">Actions</th>
    </tr>
  </thead>
  <tbody>
    {materials.map((m) => {
      const low = m.low_stock_threshold && m.stock_grams < m.low_stock_threshold;
      return (
        <tr key={m.id} className="hover:bg-gray-50">
          <td className="px-4 py-2 border border-gray-300">{m.name}</td>
          <td className="px-4 py-2 border border-gray-300">
            {suppliers.find((s) => s.id === m.supplier_id)?.name || "-"}
          </td>
          <td className="px-4 py-2 border border-gray-300">
            {categories.find((c) => c.id === m.category_id)?.name_english || "-"}
          </td>
          <td className="px-4 py-2 border border-gray-300 text-right">{m.price_per_gram} EGP</td>
          <td className="px-4 py-2 border border-gray-300 text-right">{m.stock_grams}</td>
          <td className="px-4 py-2 border border-gray-300 text-right">{m.low_stock_threshold || "-"}</td>
          <td className="px-4 py-2 border border-gray-300 text-center">
            {low ? (
              <span className="text-red-600 font-semibold">Low</span>
            ) : (
              <span className="text-green-600 font-semibold">OK</span>
            )}
          </td>
          <td className="px-4 py-2 border border-gray-300 text-center space-x-2">
            <button
              onClick={() => openEditModal(m)}
              className="text-blue-600 hover:text-blue-800"
              title="Edit"
            >
              <Edit className="h-4 w-4 inline" />
            </button>
            <button
              onClick={() => handleDelete(m.id)}
              className="text-red-600 hover:text-red-800"
              title="Delete"
            >
              <Trash2 className="h-4 w-4 inline" />
            </button>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>


      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-96">
            <h2 className="font-bold mb-3">{editingMaterial ? "Edit Material" : "Add Material"}</h2>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full mb-2 border px-2 py-1"
            />
            <input
              type="number"
              placeholder="Price per gram"
              value={formData.price_per_gram}
              onChange={(e) => setFormData({ ...formData, price_per_gram: e.target.value })}
              className="w-full mb-2 border px-2 py-1"
            />
            <input
              type="number"
              placeholder="Stock grams"
              value={formData.stock_grams}
              onChange={(e) => setFormData({ ...formData, stock_grams: e.target.value })}
              className="w-full mb-2 border px-2 py-1"
            />
            <select
              value={formData.supplier_id}
              onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              className="w-full mb-2 border px-2 py-1"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full mb-2 border px-2 py-1"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name_english}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Low Stock Threshold"
              value={formData.low_stock_threshold}
              onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
              className="w-full mb-2 border px-2 py-1"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="border px-3 py-1">Cancel</button>
              <button onClick={handleSave} className="bg-primary-600 text-white px-3 py-1 rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
