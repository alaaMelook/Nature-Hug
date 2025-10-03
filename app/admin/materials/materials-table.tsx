"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Plus, Edit, Trash2, Upload, Download } from "lucide-react";
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
      router.refresh(); // ✅ رجّع البيانات من السيرفر
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
      router.refresh(); // ✅ refresh بعد الحذف
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
        <button onClick={openAddModal} className="px-3 py-2 bg-primary-600 text-white rounded">
          <Plus className="h-4 w-4 mr-1" /> Add Material
        </button>
        <button onClick={handleExport} className="px-3 py-2 bg-green-600 text-white rounded flex items-center gap-1">
          <Download className="h-4 w-4" /> Export
        </button>
        <label className="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer flex items-center gap-1">
          <Upload className="h-4 w-4" /> Import
          <input type="file" accept=".xlsx" hidden onChange={handleImport} />
        </label>
      </div>

      <DataGrid rows={materials} columns={columns} getRowId={(row) => row.id} disableRowSelectionOnClick />

      <div className="mt-4 p-3 bg-gray-100 rounded">
        <p className="font-semibold">Total Stock (grams): <span className="text-blue-600">{totalStock}</span></p>
        <p className="font-semibold">Total Inventory Value: <span className="text-green-600">{totalInventoryValue.toFixed(2)}</span></p>
      </div>
    </div>
  );
}
