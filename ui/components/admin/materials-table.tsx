"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Plus, Edit, Trash2, Upload, Download, Layers } from "lucide-react";
import * as XLSX from "xlsx";
import { Material, Unit } from "@/domain/entities/database/material";
import { units } from "@/lib/utils/units";
import { deleteMaterial, insertMaterials, updateMaterial } from "@/ui/hooks/admin/useMaterials";
import { toast } from "sonner";

export function MaterialsTable({
  initialMaterials,

}: {
  initialMaterials: Material[];

}) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials || []);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<Partial<Material>>({});

  const router = useRouter();

  /** ───────────────────────────────
   * 🟢 Modal Open (Add / Edit)
   * ─────────────────────────────── */
  const openAddModal = () => {
    setEditingMaterial(null);
    setFormData({
    });
    setShowModal(true);
  };

  const openEditModal = (material: Material) => {
    setEditingMaterial(material);
    setFormData(material);
    setShowModal(true);
  };

  /** ───────────────────────────────
   * 💾 Save Material
   * ─────────────────────────────── */
  const handleSave = async () => {
    if (editingMaterial) {
      try {
        // Update existing material
        const res = await updateMaterial(formData);
        if (res.error) {
          toast.error("Update failed: " + res.error);
          return;
        }
        toast.success("Update successful");
        setMaterials((prev) =>
          prev.map((m) =>
            m.id === editingMaterial.id ? { ...m, ...formData } as Material : m
          )
        );

        setEditingMaterial(null);
        setFormData({});
        setShowModal(false);

      } catch (err) {
        console.error("handleSave error:", err);
        alert("Save failed");
      }
    }
  };

  /** ───────────────────────────────
   * ❌ Delete
   * ─────────────────────────────── */
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    try {
      await deleteMaterial(id);
      alert("Delete successful");
      router.refresh();
    } catch (err) {
      console.error("handleDelete error:", err);
      alert("Delete failed");
    }
  };

  /** ───────────────────────────────
   * 📤 Export
   * ─────────────────────────────── */
  const handleExport = () => {
    const exportData = materials.map((m) => ({
      name: m.name,
      price_per_gram: m.price_per_gram,
      stock_grams: m.stock_grams,
      supplier_id: m.supplier_id,
      unit_id: m.unit,
      low_stock_threshold: m.low_stock_threshold,
      material_type: m.material_type || "normal",

    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Materials");
    XLSX.writeFile(wb, "materials.xlsx");
  };

  /** ───────────────────────────────
   * 📥 Import
   * ─────────────────────────────── */
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      const formatted: Partial<Material>[] = rows.map((r) => ({
        name: r.name,
        price_per_gram: Number(r.price_per_gram || 0),
        stock_grams: Number(r.stock_grams || 0),
        supplier_id: Number(r.supplier_id) || null,
        unit: r.unit as Unit || null,
        low_stock_threshold: r.low_stock_threshold
          ? Number(r.low_stock_threshold)
          : null,
        material_type: r.material_type || "normal",

      }));

      await insertMaterials(formatted);
      alert("Import successful");
      router.refresh();
    } catch (err) {
      console.error("handleImport error:", err);
      alert("Import failed");
    } finally {
      if (e.target) (e.target as HTMLInputElement).value = "";
    }
  };

  /** ───────────────────────────────
   * 📊 Table Columns
   * ─────────────────────────────── */
  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "unit",
      headerName: "Unit",
      flex: 1,
      renderCell: (params) => params.row.unit || "-",
    },
    { field: "price_per_gram", headerName: "Price/g", flex: 1 },
    { field: "stock_grams", headerName: "Stock", flex: 1 },
    {
      field: "material_type",
      headerName: "Type",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <div className="space-x-2">
          <button
            onClick={() => openEditModal(params.row as Material)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="h-4 w-4 inline" />
          </button>
          <button
            onClick={() => handleDelete((params.row as Material).id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4 inline" />
          </button>
        </div>
      ),
    },
  ];

  /** ───────────────────────────────
   * 📈 Totals
   * ─────────────────────────────── */
  const totalInventoryValue = useMemo(
    () =>
      materials.reduce(
        (sum, m) => sum + (m.price_per_gram || 0) * (m.stock_grams || 0),
        0
      ),
    [materials]
  );

  const totalStock = useMemo(
    () => materials.reduce((sum, m) => sum + (m.stock_grams || 0), 0),
    [materials]
  );

  /** ───────────────────────────────
   * 🖥️ Render
   * ─────────────────────────────── */
  return (
    <div style={{ height: 700, width: "100%" }}>
      <div className="flex flex-wrap gap-2 mb-4">
        {/* <button
          onClick={openAddModal}
          className="px-3 py-2 bg-amber-700 text-white rounded flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Material
        </button> */}

        {/* <button
          onClick={() => router.push("/admin/materials/units")}
          className="px-3 py-2 bg-gray-600 text-white rounded flex items-center gap-1"
        >
          <Layers className="h-4 w-4" /> Manage Units
        </button> */}

        <button
          onClick={handleExport}
          className="px-3 py-2 bg-green-600 text-white rounded flex items-center gap-1"
        >
          <Download className="h-4 w-4" /> Export
        </button>

        <label className="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer flex items-center gap-1">
          <Upload className="h-4 w-4" /> Import
          <input type="file" accept=".xlsx" hidden onChange={handleImport} />
        </label>
      </div>

      <DataGrid
        rows={materials}
        columns={columns}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
      />

      <div className="mt-4 p-3 bg-gray-100 rounded">
        <p className="font-semibold">
          Total Stock (grams):{" "}
          <span className="text-blue-600">{totalStock}</span>
        </p>
        <p className="font-semibold">
          Total Inventory Value:{" "}
          <span className="text-green-600">{totalInventoryValue.toFixed(2)}</span>
        </p>
      </div>

      {/* 🟡 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[500px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingMaterial ? "Edit Material" : "Add Material"}
            </h3>

            <div className="space-y-3">
              {/* Name */}
              <label className="block text-sm font-medium mb-1">
                Material Name
              </label>
              <input
                type="text"
                placeholder="Material Name"
                className="border w-full p-2 rounded"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              {/* Price */}
              <label className="block text-sm font-medium mb-1">
                Price per gram
              </label>
              <input
                type="number"
                placeholder="Price per gram"
                className="border w-full p-2 rounded"
                value={formData.price_per_gram}
                onChange={(e) =>
                  setFormData({ ...formData, price_per_gram: Number(e.target.value) })
                }
              />

              {/* Stock */}
              <label className="block text-sm font-medium mb-1">
                Stock (grams)
              </label>
              <input
                type="number"
                placeholder="Stock in grams"
                className="border w-full p-2 rounded"
                value={formData.stock_grams}
                onChange={(e) =>
                  setFormData({ ...formData, stock_grams: Number(e.target.value) })
                }
              />

              {/* Unit */}
              <label className="block text-sm font-medium mb-1">
                Unit
              </label>
              <select
                className="border w-full p-2 rounded"
                value={formData.unit ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value as Unit })
                }
              >
                <option value="">Select Unit</option>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>

              {/* Supplier
              <select
                className="border w-full p-2 rounded"
                value={formData.supplier_id ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, supplier_id: Number(e.target.value) })
                }
              >
                <option value="">Select Supplier</option>
                 {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))} 
              </select> */}

              {/* Low stock */}
              <label className="block text-sm font-medium mb-1">
                Low Stock Threshold
              </label>
              <input
                type="number"
                placeholder="Low Stock Threshold"
                className="border w-full p-2 rounded"
                value={formData.low_stock_threshold ?? 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    low_stock_threshold: Number(e.target.value),
                  })
                }
              />

              {/* Material Type */}
              <label className="block text-sm font-medium mb-1">
                Material Type
              </label>
              <select
                className="border w-full p-2 rounded"
                value={formData.material_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    material_type: e.target.value as
                      | "normal"
                      | "special"
                      | "other",
                  })
                }
              >
                <option value="normal">Normal</option>
                <option value="special">Special</option>
                <option value="other">Other</option>
              </select>

              {/* ✅ Products Checkboxes
              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Products
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto border p-2 rounded">
                  {products.map((p) => {
                    const isChecked = formData.products.includes(Number(p.id));
                    return (
                      <label key={p.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...formData.products, Number(p.id)]
                              : formData.products.filter(
                                (id) => id !== Number(p.id)
                              );
                            setFormData({ ...formData, products: updated });
                          }}
                        />
                        {p.name_english || p.name_arabic || `Product #${p.id}`}
                      </label>
                    );
                  })}
                </div>
              </div> */}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded"
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
