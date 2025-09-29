"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface Movement {
  id: number;
  date: string;
  type: string;
  quantity: number;
  note: string | null;
  material?: { id: number; name: string };
  user_id?: number;
}

export default function MovementsPage() {
  const [rows, setRows] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMovements() {
      try {
        const res = await fetch("/api/admin/movements");
        const data = await res.json();
        setRows(data);
      } catch (err) {
        console.error("Failed to load movements:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMovements();
  }, []);

  const columns: GridColDef[] = [
    { field: "date", headerName: "Date", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },
    {
      field: "material",
      headerName: "Material",
      flex: 1,
      renderCell: (params) => params.row.material?.name || "-",
    },
    { field: "quantity", headerName: "Quantity", flex: 1 },
    { field: "note", headerName: "Note", flex: 1 },
    { field: "user_id", headerName: "User", flex: 1 },
  ];

  return (
    <div style={{ height: 600, width: "100%" }}>
      <h1 className="text-2xl font-bold mb-4">Movements</h1>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        disableRowSelectionOnClick
      />
    </div>
  );
}
