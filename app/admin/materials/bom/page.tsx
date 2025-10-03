"use client";

import { useEffect, useMemo, useState } from "react";

type Product = { id: number; name_english: string };
type Variant = { id: number; product_id: number; name: string };
type Material = {
  id: number;
  name: string;
  price_per_gram: number;
  material_type: "normal" | "variant" | "perfume";
};

type BOMRow = {
  id: number;
  isVariant: boolean;
  product_id: number | null;
  product_name: string;
  variant_id: number | null;
  variant_name: string;
  material_id: number | null;
  material_name: string;
  material_type: "normal" | "variant" | "perfume";
  grams_used: number;
  unit_cost: number;
  total_cost: number;
};

export default function BomPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [bomRows, setBomRows] = useState<BOMRow[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<number | "">("");
  const [selectedVariant, setSelectedVariant] = useState<number | "">("");

  // modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMaterialId, setAddMaterialId] = useState<number | "">("");
  const [addGrams, setAddGrams] = useState<number | "">("");

  // fetch products, materials
  useEffect(() => {
    async function fetchAll() {
      try {
        const [pRes, mRes] = await Promise.all([
          fetch("/api/admin/products").then((r) => r.json()),
          fetch("/api/admin/materials").then((r) => r.json()),
        ]);

        setProducts(pRes.data || []);
        setMaterials(mRes.data || []);
      } catch (err) {
        console.error("fetch initial lists error:", err);
      }
    }
    fetchAll();
  }, []);

  // fetch variants when selectedProduct changes
  useEffect(() => {
    async function getVariants() {
      if (!selectedProduct) {
        setVariants([]);
        return;
      }
      try {
        const res = await fetch(`/api/admin/variants?product_id=${selectedProduct}`);
        const json = await res.json();
        setVariants(json.data || []);
      } catch (err) {
        console.error("fetch variants error:", err);
      }
    }
    getVariants();
  }, [selectedProduct]);

  // fetch BOM whenever selectedProduct or selectedVariant changes
  useEffect(() => {
    async function fetchBOM() {
      try {
        let url = "/api/admin/bom_entries";
        if (selectedVariant) url += `?variant_id=${selectedVariant}`;
        else if (selectedProduct) url += `?product_id=${selectedProduct}`;

        const res = await fetch(url);
        const json = await res.json();

        if (json.success) {
          setBomRows(json.data || []);
        } else {
          setBomRows([]);
        }
      } catch (err) {
        console.error("fetch BOM error:", err);
      }
    }
    fetchBOM();
  }, [selectedProduct, selectedVariant]);

  // Helpers: sums by material_type
  const sums = useMemo(() => {
    const normal = bomRows
      .filter((r) => r.material_type === "normal")
      .reduce((s, r) => s + r.total_cost, 0);
    const variant = bomRows
      .filter((r) => r.material_type === "variant")
      .reduce((s, r) => s + r.total_cost, 0);
    const perfume = bomRows
      .filter((r) => r.material_type === "perfume")
      .reduce((s, r) => s + r.total_cost, 0);
    const total = normal + variant + perfume;
    return { normal, variant, perfume, total };
  }, [bomRows]);

  // Add material
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMaterialId || !addGrams) return alert("Select material and grams");

    const material = materials.find((m) => m.id === addMaterialId);
    if (!material) return alert("Invalid material");

    const body: any = {
      material_id: addMaterialId,
      grams_used: Number(addGrams),
      product_id: selectedProduct,
    };

    // لو المادة نوعها variant يبقى لازم يختار variant_id
    if (material.material_type === "variant") {
      if (!selectedVariant) return alert("Choose a variant first");
      body.variant_id = selectedVariant;
    }

    try {
      const res = await fetch("/api/admin/bom_entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.error || "Add failed");
        return;
      }
      setBomRows((prev) => [...prev, json.data]);
      setAddMaterialId("");
      setAddGrams("");
      setShowAddModal(false);
    } catch (err) {
      console.error("handleAdd error:", err);
      alert("Add failed");
    }
  };

  // edit grams
  const handleEdit = async (row: BOMRow) => {
    const newGr = prompt("Enter new grams:", String(row.grams_used));
    if (!newGr) return;
    const grams = Number(newGr);
    if (isNaN(grams) || grams <= 0) return alert("Invalid grams value");

    try {
      const res = await fetch("/api/admin/bom_entries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, grams_used: grams }),
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.error || "Update failed");
        return;
      }
      setBomRows((prev) => prev.map((r) => (r.id === row.id ? json.data : r)));
    } catch (err) {
      console.error("handleEdit error:", err);
      alert("Update failed");
    }
  };

  // delete
  const handleDelete = async (row: BOMRow) => {
    if (!confirm("Delete this material from BOM?")) return;
    try {
      const res = await fetch("/api/admin/bom_entries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id }),
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.error || "Delete failed");
        return;
      }
      setBomRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (err) {
      console.error("handleDelete error:", err);
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">BOM Manager</h1>

      <div className="flex gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-medium">Product</label>
          <select
            className="border p-2"
            value={selectedProduct}
            onChange={(e) => {
              setSelectedProduct(e.target.value ? Number(e.target.value) : "");
              setSelectedVariant("");
            }}
          >
            <option value="">-- Select product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name_english}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Variant (optional)</label>
          <select
            className="border p-2"
            value={selectedVariant}
            onChange={(e) =>
              setSelectedVariant(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">-- All / none --</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            className="bg-blue-600 text-white px-3 py-2 rounded"
            onClick={() => {
              if (!selectedProduct) return alert("Choose product first");
              setShowAddModal(true);
            }}
          >
            Add Material
          </button>
        </div>
      </div>

      {/* BOM Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2">Material</th>
              <th className="border px-3 py-2">Type</th>
              <th className="border px-3 py-2">Unit Cost</th>
              <th className="border px-3 py-2">Grams Used</th>
              <th className="border px-3 py-2">Total Cost</th>
              <th className="border px-3 py-2">Variant</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bomRows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.material_name}</td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      r.material_type === "normal"
                        ? "bg-green-100 text-green-700"
                        : r.material_type === "variant"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {r.material_type === "perfume"
                      ? "Perfume 🧴"
                      : r.material_type}
                  </span>
                </td>
                <td className="px-3 py-2">{r.unit_cost.toFixed(2)}</td>
                <td className="px-3 py-2">{r.grams_used}</td>
                <td className="px-3 py-2">{r.total_cost.toFixed(2)}</td>
                <td className="px-3 py-2">{r.isVariant ? r.variant_name : "-"}</td>
                <td className="px-3 py-2">
                  <button
                    className="text-blue-600 mr-2"
                    onClick={() => handleEdit(r)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => handleDelete(r)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {bomRows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-4 text-center text-gray-500"
                >
                  No BOM entries for selected product/variant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* summary */}
      <div className="mt-4 grid grid-cols-4 gap-4">
        <div className="p-3 bg-gray-50 rounded shadow">
          <div className="text-sm text-gray-500">Normal cost</div>
          <div className="text-xl font-bold">{sums.normal.toFixed(2)}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded shadow">
          <div className="text-sm text-gray-500">Variant cost</div>
          <div className="text-xl font-bold">{sums.variant.toFixed(2)}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded shadow">
          <div className="text-sm text-gray-500">Perfume cost</div>
          <div className="text-xl font-bold">{sums.perfume.toFixed(2)}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded shadow">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-xl font-bold">{sums.total.toFixed(2)}</div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-[480px]">
            <h3 className="text-lg font-bold mb-4">Add Material to BOM</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Material</label>
                <select
                  className="w-full border p-2"
                  value={addMaterialId}
                  onChange={(e) =>
                    setAddMaterialId(e.target.value ? Number(e.target.value) : "")
                  }
                >
                  <option value="">-- Select material --</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.material_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Grams Used</label>
                <input
                  type="number"
                  className="w-full border p-2"
                  value={addGrams ?? ""}
                  onChange={(e) =>
                    setAddGrams(e.target.value ? Number(e.target.value) : "")
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="border px-3 py-1"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
