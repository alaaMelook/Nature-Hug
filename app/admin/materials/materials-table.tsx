"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Plus, Edit, Trash2, Upload, Download } from "lucide-react";
import * as XLSX from "xlsx";
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

  const supabase = createSupabaseBrowserClient();

  const fetchMaterials = useCallback(async () => {
    const { data } = await supabase
      .from("materials")
      .select("*, supplier:suppliers(id, name), category:categories(id, name_english)");
    if (data) setMaterials(data as Material[]);
  }, [supabase]);

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
    const materialData = {
      name: formData.name,
      price_per_gram: Number(formData.price_per_gram),
      stock_grams: Number(formData.stock_grams),
      supplier_id: formData.supplier_id ? Number(formData.supplier_id) : null,
      category_id: formData.category_id ? Number(formData.category_id) : null,
      low_stock_threshold: formData.low_stock_threshold
        ? Number(formData.low_stock_threshold)
        : null,
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
    await supabase.from("materials").delete().eq("id", id);
    fetchMaterials();
  };

  // ✅ Export to Excel
  const handleExport = () => {
    const exportData = materials.map((m) => ({
      name: m.name,
      price_per_gram: m.price_per_gram,
      stock_grams: m.stock_grams,
      supplier_id: m.supplier_id,
      category_id: m.category_id,
      low_stock_threshold: m.low_stock_threshold,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Materials");
    XLSX.writeFile(wb, "materials.xlsx");
  };

  // ✅ Import from Excel
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    // إدخال البيانات للـ DB
    const formatted = rows.map((r) => ({
      name: r.name,
      price_per_gram: Number(r.price_per_gram),
      stock_grams: Number(r.stock_grams),
      supplier_id: r.supplier_id ? Number(r.supplier_id) : null,
      category_id: r.category_id ? Number(r.category_id) : null,
      low_stock_threshold: r.low_stock_threshold ? Number(r.low_stock_threshold) : null,
    }));

    const { error } = await supabase.from("materials").insert(formatted);
    if (error) {
      alert(error.message);
    } else {
      fetchMaterials();
    }
  };

  // ✅ DataGrid columns
  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "supplier",
      headerName: "Supplier",
      flex: 1,
      renderCell: (params) => params.row.supplier?.name || "-",
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      renderCell: (params) => params.row.category?.name_english || "-",
    },
    { field: "price_per_gram", headerName: "Price/g", flex: 1 },
    { field: "stock_grams", headerName: "Stock", flex: 1 },
    {
      field: "total_value",
      headerName: "Total Value",
      flex: 1,
      renderCell: (params) => {
        const total = params.row.price_per_gram * params.row.stock_grams;
        return <span>{total.toFixed(2)}</span>;
      },
    },
    { field: "low_stock_threshold", headerName: "Threshold", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const low =
          params.row.low_stock_threshold &&
          params.row.stock_grams < params.row.low_stock_threshold;
        return (
          <span className={low ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
            {low ? "Low" : "OK"}
          </span>
        );
      },
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

  // ✅ إجمالي القيمة والمخزون
  const totalInventoryValue = useMemo(() => {
    return materials.reduce((sum, m) => sum + m.price_per_gram * m.stock_grams, 0);
  }, [materials]);

  const totalStock = useMemo(() => {
    return materials.reduce((sum, m) => sum + m.stock_grams, 0);
  }, [materials]);

  return (
    <div style={{ height: 700, width: "100%" }}>
      <div className="flex gap-2 mb-4">
        <button
          onClick={openAddModal}
          className="px-3 py-2 bg-primary-600 text-white rounded"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Material
        </button>
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

      {/* ✅ ملخص تحت الجدول */}
      <div className="mt-4 p-3 bg-gray-100 rounded">
        <p className="font-semibold">
          Total Stock (grams): <span className="text-blue-600">{totalStock}</span>
        </p>
        <p className="font-semibold">
          Total Inventory Value:{" "}
          <span className="text-green-600">{totalInventoryValue.toFixed(2)}</span>
        </p>
      </div>

      {/* المودال زي ما هو */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-96">
            <h2 className="font-bold mb-3">
              {editingMaterial ? "Edit Material" : "Add Material"}
            </h2>
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
              onChange={(e) =>
                setFormData({ ...formData, price_per_gram: e.target.value })
              }
              className="w-full mb-2 border px-2 py-1"
            />
            <input
              type="number"
              placeholder="Stock grams"
              value={formData.stock_grams}
              onChange={(e) =>
                setFormData({ ...formData, stock_grams: e.target.value })
              }
              className="w-full mb-2 border px-2 py-1"
            />
            <select
              value={formData.supplier_id}
              onChange={(e) =>
                setFormData({ ...formData, supplier_id: e.target.value })
              }
              className="w-full mb-2 border px-2 py-1"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              className="w-full mb-2 border px-2 py-1"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_english}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Low Stock Threshold"
              value={formData.low_stock_threshold}
              onChange={(e) =>
                setFormData({ ...formData, low_stock_threshold: e.target.value })
              }
              className="w-full mb-2 border px-2 py-1"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="border px-3 py-1">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-primary-600 text-white px-3 py-1 rounded"
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
