"use client";

import React, { useEffect, useMemo, useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

// Types
type ItemType = "raw" | "product" | "tool" | "other";
type FilterType = "needed" | "pending" | "completed" | "selected";

type MissingItem = {
  id: number | string;
  name: string;
  type: ItemType | string;
  quantity?: number | null;
  price?: number | null;
  supplier_id?: number | null;
  suppliers?: { name?: string | null } | null;
  material_id?: number | null;
  materials?: { name?: string | null } | null;
  notes?: string | null;
  image_url?: string | null;
  checked?: boolean;
  purchased?: boolean;
  created_at?: string;
  updated_at?: string;
  is_auto?: boolean;
};

type Supplier = { id: number; name: string };
type Material = {
  id: number;
  name: string;
  stock_grams: number;
  low_stock_threshold: number;
  price_per_gram?: number;
};

export default function MissingItemsPage() {
  // State
  const [items, setItems] = useState<MissingItem[]>([]);
  const [form, setForm] = useState<Partial<MissingItem> & { new_raw_name?: string }>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filters, setFilters] = useState<{ [K in FilterType]?: boolean }>({
    needed: false,
    pending: false,
    completed: false,
    selected: false,
  });
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Fetch Data
  async function fetchItems() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/materials/missing-items");
      const missing = await res.json();
      setItems(missing || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  async function fetchSuppliers() {
    const res = await fetch("/api/admin/suppliers");
    if (res.ok) setSuppliers(await res.json());
  }
  async function fetchMaterials() {
    const res = await fetch("/api/admin/materials");
    if (res.ok) setMaterials(await res.json());
  }
  useEffect(() => {
    fetchItems();
    fetchSuppliers();
    fetchMaterials();
  }, []);

  // مواد قليلة المخزون (low in stock)
  const lowStockMaterials = useMemo(() => {
    return materials.filter(
      (mat) =>
        mat.stock_grams <= mat.low_stock_threshold
    );
  }, [materials]);

  // --- Filtering ---
  const filtered = useMemo(() => {
    let list = [...items];

    // Needed (low stock)
    if (filters.needed) {
      // مواد قليلة المخزون تظهر تلقائيًا
      const lowStockAsMissing: MissingItem[] = lowStockMaterials.map((mat) => ({
        id: `auto-low-${mat.id}`,
        name: mat.name,
        type: "raw",
        quantity: mat.stock_grams,
        price: mat.price_per_gram,
        supplier_id: undefined,
        suppliers: undefined,
        material_id: mat.id,
        materials: { name: mat.name },
        notes: "Low stock (auto-detected)",
        checked: false,
        purchased: false,
        created_at: "",
        updated_at: "",
        is_auto: true,
      }));
      list = [
        ...list.filter((i) => i.type === "raw" && lowStockMaterials.some((m) => m.id === i.material_id)),
        ...lowStockAsMissing,
      ];
    }
    // Other filters
    if (filters.pending) list = list.filter((i) => !i.purchased);
    if (filters.completed) list = list.filter((i) => i.purchased);
    if (filters.selected) list = list.filter((i) => i.checked);
    return list;
  }, [items, filters, lowStockMaterials]);

  // السعر النهائي فقط
  const totalSelected = useMemo(
    () =>
      filtered.filter((i) => i.checked).reduce((sum, i) => sum + (i.price || 0), 0),
    [filtered]
  );
  const totalOverall = useMemo(
    () => filtered.reduce((sum, i) => sum + (i.price || 0), 0),
    [filtered]
  );

  // --- Save Item: الاسم مع المواد الخام ---
  async function saveItem(e?: React.FormEvent) {
    if (e) e.preventDefault();

    let name = form.name;

    // لو النوع Raw Material
    if (form.type === "raw") {
      if (form.material_id) {
        // خذ الاسم من المادة المختارة
        const mat = materials.find((m) => m.id === form.material_id);
        if (mat) name = mat.name;
      } else if (form.new_raw_name && form.new_raw_name.trim() !== "") {
        name = form.new_raw_name.trim();
      } else {
        return alert("يجب اختيار مادة خام أو كتابة اسم جديد");
      }
    } else {
      // لغير المواد الخام يجب ادخال الاسم
      if (!name || name.trim() === "") return alert("يجب ادخال الاسم");
    }

    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { ...form, id: editingId, name } : { ...form, name };
    const res = await fetch("/api/admin/materials/missing-items", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      alert("❌ " + (data.error || "Error"));
      return;
    }
    await fetchItems();
    setForm({});
    setEditingId(null);
  }

  async function deleteItem(id: number | string) {
    if (!confirm("Delete this item?")) return;
    const res = await fetch("/api/admin/materials/missing-items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function toggleCheck(id: number | string, checked: boolean) {
    const res = await fetch("/api/admin/materials/missing-items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, checked }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked } : i)));
    }
  }

  async function markComplete(item: MissingItem) {
    try {
      const res = await fetch("/api/admin/materials/missing-items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          purchased: true,
          checked: false,
          updated_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert("❌ Error completing item: " + err.error);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, purchased: true, checked: false } : i
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  // --- Export ---
  const exportXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Missing Items");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `missing_items_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
  const exportPDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.text("Missing Items Report", 14, 10);
    autoTable(doc, {
      head: [["Name", "Type", "Qty", "Price", "Total"]],
      body: filtered.map((i) => [
        i.name,
        i.type,
        i.quantity ?? "-",
        i.price ?? "-",
        (i.price || 0).toFixed(2),
      ]),
    });
    doc.save("missing_items.pdf");
  };

  async function createPurchaseInvoice() {
    const selected = items.filter((i) => i.checked);
    if (!selected.length) return alert("Select items first!");
    const body = { itemIds: selected.map((i) => i.id) };
    const res = await fetch("/api/admin/product-materials/from-missing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      alert("✅ Purchase invoice(s) created successfully!");
      fetchItems();
    } else {
      alert("⚠️ " + (data.error || "Failed to create invoice"));
    }
  }

  // --- UI ---
  const isRawMaterial = form.type === "raw";
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">📦 Missing Items</h1>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          <button onClick={exportXLSX} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Export XLSX</button>
          <button onClick={exportPDF} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Export PDF</button>
          <button onClick={createPurchaseInvoice} className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">🧾 Create Purchase Invoice</button>
        </div>
        {/* Filters as checkboxes */}
        <div className="flex gap-3 items-center">
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={filters.needed} onChange={e => setFilters(f => ({ ...f, needed: e.target.checked }))}/> Needed (Low Stock)
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={filters.pending} onChange={e => setFilters(f => ({ ...f, pending: e.target.checked }))}/> Pending
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={filters.completed} onChange={e => setFilters(f => ({ ...f, completed: e.target.checked }))}/> Completed
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={filters.selected} onChange={e => setFilters(f => ({ ...f, selected: e.target.checked }))}/> Selected
          </label>
        </div>
      </div>
      {/* Add/Edit Form */}
      <form onSubmit={saveItem} className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">{editingId ? "✏️ Edit Item" : "➕ Add New Item"}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {/* الاسم أو اختيار المادة الخام */}
          {!isRawMaterial ? (
            <input className="border rounded-md px-3 py-2" placeholder="Item name" required value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })}/>
          ) : (
            <div className="flex gap-2">
              <select className="border rounded-md px-3 py-2 flex-1"
                value={form.material_id ?? ""}
                onChange={e => setForm({ ...form, material_id: Number(e.target.value), new_raw_name: "" })}
              >
                <option value="">Select Material</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <span className="text-gray-500">أو</span>
              <input className="border rounded-md px-3 py-2 flex-1"
                placeholder="اسم مادة خام جديدة"
                value={form.new_raw_name || ""}
                onChange={e => setForm({ ...form, new_raw_name: e.target.value, material_id: undefined })}
              />
            </div>
          )}
          {/* النوع */}
          <select className="border rounded-md px-3 py-2"
            value={form.type || "raw"}
            onChange={e => setForm({ ...form, type: e.target.value as ItemType, name: "", new_raw_name: "", material_id: undefined })}
          >
            <option value="raw">Raw Material</option>
            <option value="product">Product</option>
            <option value="tool">Tool</option>
            <option value="other">Other</option>
          </select>
          {/* المورد */}
          <select className="border rounded-md px-3 py-2"
            value={form.supplier_id ?? ""}
            onChange={e => setForm({ ...form, supplier_id: e.target.value ? Number(e.target.value) : null })}
            required
          >
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {/* الكمية */}
          <input type="number" className="border rounded-md px-3 py-2"
            placeholder="Quantity"
            value={form.quantity ?? ""}
            onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
          />
          {/* السعر */}
          <input type="number" className="border rounded-md px-3 py-2"
            placeholder="Final Price"
            value={form.price ?? ""}
            onChange={e => setForm({ ...form, price: Number(e.target.value) })}
          />
          {/* ملاحظات */}
          <input className="border rounded-md px-3 py-2 md:col-span-2"
            placeholder="Notes"
            value={form.notes || ""}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <div className="flex gap-3 mt-4">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            {editingId ? "Save Changes" : "Add Item"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setForm({}); setEditingId(null); }}
              className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
            >Cancel</button>
          )}
        </div>
      </form>
      {/* Items List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-gray-500">No items found.</p>
          ) : (
            filtered.map((it) => {
              const total = it.price || 0;
              const isComplete = it.purchased || false;
              return (
                <div key={it.id}
                  className={`flex items-center justify-between border rounded-md p-4 shadow-sm ${it.is_auto ? "bg-yellow-50 border-yellow-200" : isComplete ? "bg-green-50 border-green-300 opacity-80" : "bg-white"}`}>
                  <div className="flex items-start gap-3 flex-1">
                    {!it.is_auto && (
                      <input type="checkbox" checked={!!it.checked} onChange={e => toggleCheck(it.id, e.target.checked)} className="mt-1 accent-blue-600"/>
                    )}
                    <div>
                      <h3 className={`font-semibold ${isComplete ? "text-green-700 line-through" : "text-gray-800"}`}>{it.name}</h3>
                      <p className="text-sm text-gray-600">
                        {it.type} • Qty: {it.quantity ?? "-"} • Final Price: {it.price ?? "-"} • Total: {total.toFixed(2)} EGP
                      </p>
                      {it.suppliers?.name && (
                        <p className="text-xs text-gray-500">Supplier: {it.suppliers.name}</p>
                      )}
                      {it.materials?.name && (
                        <p className="text-xs text-gray-500">Material: {it.materials.name}</p>
                      )}
                      {it.notes && (
                        <p className="text-xs text-gray-500 mt-1">{it.notes}</p>
                      )}
                      {isComplete && (
                        <p className="text-xs text-green-600 mt-1">✅ Completed</p>
                      )}
                      {it.is_auto && (
                        <p className="text-xs text-yellow-700 mt-1">
                          ⚠️ Low of Stock (Auto-detected)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isComplete && !it.is_auto && (
                      <button onClick={() => markComplete(it)} className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200">Complete</button>
                    )}
                    {!it.is_auto && (
                      <button onClick={() => { setEditingId(Number(it.id)); setForm(it); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                      >Edit</button>
                    )}
                    {!it.is_auto && (
                      <button onClick={() => deleteItem(it.id)} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200">Delete</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      {/* Footer Summary */}
      <div className="mt-8 bg-gray-50 border border-gray-200 p-5 rounded-md flex items-center justify-between">
        <div className="text-sm text-gray-600">Total items: {filtered.length}</div>
        <div className="text-right">
          <div className="text-gray-500 text-sm">Overall total:</div>
          <div className="text-xl font-bold text-gray-800">{totalOverall.toFixed(2)} EGP</div>
        </div>
      </div>
    </div>
  );
}