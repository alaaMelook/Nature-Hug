"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface Material {
  id: number;
  name: string;
  stock_grams: number;
  price_per_gram: number;
  total_value: number;
}

export default function InventoryPage() {
  const [rows, setRows] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/inventory"); // ✅ عدلت المسار
        const data = await res.json();
        setRows(data);
      } catch (error) {
        console.error("Failed to load inventory:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const columns: GridColDef[] = [
    { field: "name", headerName: "Ingredient", flex: 1 },
    { field: "stock_grams", headerName: "Current Stock (g)", flex: 1 },
    { field: "price_per_gram", headerName: "Price/Unit (£)", flex: 1 },
    { field: "total_value", headerName: "Total Stock Value (£)", flex: 1 },
  ];

  return (
    <div style={{ height: 600, width: "100%" }}>
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading} // ✅ عشان يبين Loading state
        disableRowSelectionOnClick
      />
    </div>
  );
}
