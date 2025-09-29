"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Link from "next/link";

interface Material {
  id: number;
  name: string;
  stock_grams: number;
  price_per_gram: number;
  low_stock_threshold: number;
  supplier?: { id: number; name: string };
  category?: { id: number; name_english: string };
}

export default function InventoryPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/materials");
        const mats = await res.json();
        setMaterials(mats);
      } catch (err) {
        console.error("Error loading inventory:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ✅ Dashboard data
  const totalItems = materials.length;
  const lowItems = materials.filter((m) => m.stock_grams <= m.low_stock_threshold);
  const totalLow = lowItems.length;
  const totalValue = materials.reduce(
    (sum, m) => sum + m.stock_grams * m.price_per_gram,
    0
  );

  // ✅ Stock Table columns
  const materialCols: GridColDef[] = [
    { field: "name", headerName: "Material", flex: 1 },
    {
      field: "supplier",
      headerName: "Supplier",
      flex: 1,
      renderCell: (params) =>
        params.row.supplier ? params.row.supplier.name : "-",
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      renderCell: (params) => params.row.category?.name_english || "-",
    },
    { field: "stock_grams", headerName: "Stock (g)", flex: 1 },
    { field: "price_per_gram", headerName: "Price/g", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const stock = params.row.stock_grams;
        const threshold = params.row.low_stock_threshold;
        if (stock === 0) return <span className="text-red-600 font-bold">Out</span>;
        if (stock <= threshold)
          return <span className="text-orange-600 font-bold">Low</span>;
        return <span className="text-green-600 font-bold">OK</span>;
      },
    },
  ];

  // ✅ Low Stock by Supplier Table
  const lowStockCols: GridColDef[] = [
    {
      field: "supplier",
      headerName: "Supplier",
      flex: 1,
      renderCell: (params) =>
        params.row.supplier ? (
          <Link
            href={`/admin/materials/suppliers`}
            className="text-blue-600 hover:underline"
          >
            {params.row.supplier.name}
          </Link>
        ) : (
          "-"
        ),
    },
    { field: "name", headerName: "Material", flex: 1 },
    { field: "stock_grams", headerName: "Stock (g)", flex: 1 },
    { field: "low_stock_threshold", headerName: "Threshold", flex: 1 },
  ];

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>

      {/* ✅ Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow p-4 rounded">
          <p className="text-gray-500">Total Items</p>
          <p className="text-xl font-bold">{totalItems}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <p className="text-gray-500">Low in Stock</p>
          <p className="text-xl font-bold text-red-600">{totalLow}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <p className="text-gray-500">Total Value</p>
          <p className="text-xl font-bold">{totalValue.toFixed(2)} EGP</p>
        </div>
      </div>

      {/* ✅ Alerts */}
      {totalLow > 0 && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          🔴 {totalLow} items are low in stock!
        </div>
      )}

      {/* ✅ Stock Table */}
      <div style={{ height: 400, width: "100%" }}>
        <h2 className="font-bold mb-2">Current Stock</h2>
        <DataGrid
          rows={materials}
          columns={materialCols}
          getRowId={(row) => row.id}
          loading={loading}
          disableRowSelectionOnClick
        />
      </div>

      {/* ✅ Low Stock Table */}
      <div style={{ height: 400, width: "100%" }}>
        <h2 className="font-bold mb-2">Low Stock by Supplier</h2>
        <DataGrid
          rows={lowItems}
          columns={lowStockCols}
          getRowId={(row) => row.id}
          loading={loading}
          disableRowSelectionOnClick
        />
      </div>
    </div>
  );
}
