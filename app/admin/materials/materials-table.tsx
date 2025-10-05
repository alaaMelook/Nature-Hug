"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Plus, Edit, Trash2, Upload, Download, ExternalLink } from "lucide-react";
import * as XLSX from "xlsx";
import type { Material, Unit, Supplier, Product, MaterialFormData } from "./types";

export default function MaterialsTable({
  initialMaterials,
  units,
  suppliers,
  products,
}: {
  initialMaterials: Material[];
  units: Unit[];
  suppliers: Supplier[];
  products: Product[];
}) {
  const [materials] = useState<Material[]>(initialMaterials || []);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>({
    name: "",
    price_per_gram: "",
    stock_grams: "",
    supplier_id: "",
    low_stock_threshold: "",
    material_type: "normal",
    products: [],
    unit_id: "", // ✅ Added unit field
  });

  const router = useRouter();

  const openAddModal = () => {
    setEditingMaterial(null);
    setFormData({
      name: "",
      price_per_gram: "",
      stock_grams: "",
      supplier_id: "",
      low_stock_threshold: "",
      material_type: "normal",
      products: [],
      unit_id: "",
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
      low_stock_threshold: material.low_stock_threshold?.toString() || "",
      material_type: (material.material_type as MaterialFormData["material_type"]) || "normal",
      products: material.products?.map((p) => p.product.id) || [],
      unit_id: material.unit_id?.toString() || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const materialData = {
        name: formData.name,
        price_per_gram: Number(formData.price_per_gram || 0),
        stock_grams: Number(formData.stock_grams || 0),
        supplier_id: formData.supplier_id ? Number(formData.supplier_id) : null,
        low_stock_threshold: formData.low_stock_threshold ? Number(formData.low_stock_threshold) : null,
        material_type: formData.material_type,
        products: formData.products,
        unit_id: formData.unit_id ? Number(formData.unit_id) : null,
      };

      let res: Response;
      if (editingMaterial) {
        res = await fetch("/api/admin/materials", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingMaterial.id, ...materialData }),
        });
      } else {
        res = await fetch("/api/admin/materials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(materialData),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Save failed");
        return;
      }

      setShowModal(false);
      router.refresh();
    } catch (err) {
      console.error("handleSave error:", err);
      alert("Save failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    try {
      const res = await fetch("/api/admin/materials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Delete failed");
        return;
      }
      router.refresh();
    } catch (err) {
      console.error("handleDelete error:", err);
      alert("Delete failed");
    }
  };

  // Export
  const handleExport = () => {
    const exportData = materials.map((m) => ({
      name: m.name,
      price_per_gram: m.price_per_gram,
      stock_grams: m.stock_grams,
      supplier_id: m.supplier_id,
      low_stock_threshold: m.low_stock_threshold,
      material_type: m.material_type || "normal",
      unit_id: m.unit_id || "",
      products: m.products?.map((p) => p.product.id).join(",") || "",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Materials");
    XLSX.writeFile(wb, "materials.xlsx");
  };

  // Import
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      const formatted = rows.map((r) => ({
        name: r.name,
        price_per_gram: Number(r.price_per_gram || 0),
        stock_grams: Number(r.stock_grams || 0),
        supplier_id: r.supplier_id ? Number(r.supplier_id) : null,
        low_stock_threshold: r.low_stock_threshold ? Number(r.low_stock_threshold) : null,
        material_type: (r.material_type as MaterialFormData["material_type"]) || "normal",
        unit_id: r.unit_id ? Number(r.unit_id) : null,
        products: r.products ? String(r.products).split(",").map((id) => Number(id)) : [],
      }));

      const res = await fetch("/api/admin/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formatted),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Import failed");
        return;
      }
      router.refresh();
    } catch (err) {
      console.error("handleImport error:", err);
      alert("Import failed");
    } finally {
      if (e.target) (e.target as HTMLInputElement).value = "";
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "supplier",
      headerName: "Supplier",
      flex: 1,
      renderCell: (params) => params.row.supplier?.name || "-",
    },
    {
      field: "unit",
      headerName: "Unit",
      flex: 1,
      renderCell: (params) => params.row.unit?.name || "-",
    },
    {
      field: "products",
      headerName: "Products",
      flex: 1,
      renderCell: (params) =>
        params.row.products?.map((p: any) => p.product.name_english).join(", ") || "-",
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
          <button onClick={() => openEditModal(params.row as Material)} className="text-blue-600 hover:text-blue-800">
            <Edit className="h-4 w-4 inline" />
          </button>
          <button onClick={() => handleDelete((params.row as Material).id)} className="text-red-600 hover:text-red-800">
            <Trash2 className="h-4 w-4 inline" />
          </button>
        </div>
      ),
    },
  ];

  const totalInventoryValue = useMemo(() => {
    return materials.reduce((sum, m) => sum + (m.price_per_gram || 0) * (m.stock_grams || 0), 0);
  }, [materials]);

  const totalStock = useMemo(() => {
    return materials.reduce((sum, m) => sum + (m.stock_grams || 0), 0);
  }, [materials]);

  return (
    <div style={{ height: 700, width: "100%" }}>
      <div className="flex gap-2 mb-4">
        <button onClick={openAddModal} className="px-3 py-2 bg-primary-600 text-white rounded flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add Material
        </button>
        <button onClick={handleExport} className="px-3 py-2 bg-green-600 text-white rounded flex items-center gap-1">
          <Download className="h-4 w-4" /> Export
        </button>
        <label className="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer flex items-center gap-1">
          <Upload className="h-4 w-4" /> Import
          <input type="file" accept=".xlsx" hidden onChange={handleImport} />
        </label>

        {/* ✅ Shortcut to Units Page */}
        <button
          onClick={() => router.push("/admin/units")}
          className="px-3 py-2 bg-amber-600 text-white rounded flex items-center gap-1"
        >
          <ExternalLink className="h-4 w-4" /> Manage Units
        </button>
      </div>

      <DataGrid rows={materials} columns={columns} getRowId={(row) => row.id} disableRowSelectionOnClick />

      <div className="mt-4 p-3 bg-gray-100 rounded">
        <p className="font-semibold">
          Total Stock (grams): <span className="text-blue-600">{totalStock}</span>
        </p>
        <p className="font-semibold">
          Total Inventory Value: <span className="text-green-600">{totalInventoryValue.toFixed(2)}</span>
        </p>
      </div>

      {/* ✅ Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-[400px]">
            <h3 className="text-lg font-semibold mb-4">
              {editingMaterial ? "Edit Material" : "Add Material"}
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                className="border w-full p-2 rounded"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              {/* Supplier */}
              <select
                className="border w-full p-2 rounded"
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Unit */}
              <select
                className="border w-full p-2 rounded"
                value={formData.unit_id}
                onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
              >
                <option value="">Select Unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>

              {/* Price / Stock */}
              <input
                type="number"
                placeholder="Price per gram"
                className="border w-full p-2 rounded"
                value={formData.price_per_gram}
                onChange={(e) => setFormData({ ...formData, price_per_gram: e.target.value })}
              />

              <input
                type="number"
                placeholder="Stock (grams)"
                className="border w-full p-2 rounded"
                value={formData.stock_grams}
                onChange={(e) => setFormData({ ...formData, stock_grams: e.target.value })}
              />

              {/* Material Type */}
              <select
                className="border w-full p-2 rounded"
                value={formData.material_type}
                onChange={(e) =>
                  setFormData({ ...formData, material_type: e.target.value as MaterialFormData["material_type"] })
                }
              >
                <option value="normal">Normal</option>
                <option value="variant">Variant</option>
                <option value="perfume">Perfume</option>
              </select>

              {/* Products Multi-select */}
              <div>
                <label className="block mb-1 font-medium">Products</label>
                <select
                  multiple
                  className="border w-full p-2 rounded h-24"
                  value={formData.products.map(String)}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (o) => Number(o.value));
                    setFormData({ ...formData, products: selected });
                  }}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name_english}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
