"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface Movement {
  id: number;
  date: string;
  type: string;
  quantity: number;
  note: string | null;
  material?: { id: number; name: string };
  product?: { id: number; name_english?: string; name_arabic?: string };
  user?: { id: number; name: string };
  document_id?: number | null;
  document_type?: string | null;
  document_ref?: string | null;
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
   {
  field: "date",
  headerName: "Date",
  flex: 1,
  renderCell: (params) =>
    new Date(params.value).toLocaleString("EG", {
      dateStyle: "short",
      timeStyle: "short",
    }),
}
,    { field: "type", headerName: "Type", flex: 0.6 },
    {
      field: "material",
      headerName: "Material",
      flex: 1,
      renderCell: (params) => params.row.material?.name || "-",
    },
    {
      field: "product",
      headerName: "Product",
      flex: 1,
      renderCell: (params) =>
        params.row.product?.name_english || params.row.product?.name_arabic || "-",
    },
    { field: "quantity", headerName: "Qty", flex: 0.6 },
    {
      field: "document_ref",
      headerName: "Document",
      flex: 1,
      renderCell: (params) => {
        const doc = params.row;
        if (doc.document_type === "purchase_invoice") {
          return (
            <Link
              href={`/admin/purchases/${doc.document_id}`}
              className="text-blue-600 hover:underline"
            >
              Invoice #{doc.document_ref}
            </Link>
          );
        } else if (doc.document_type === "order") {
          return (
            <Link
              href={`/admin/orders/${doc.document_id}`}
              className="text-green-600 hover:underline"
            >
              Order {doc.document_ref}
            </Link>
          );
        }
        return "-";
      },
    },
 
    {
      field: "user",
      headerName: "User",
      flex: 1,
      renderCell: (params) => params.row.user?.name || "-",
    },
    { field: "note", headerName: "Note", flex: 1 },
  ];

  return (
    <div style={{ height: 650, width: "100%" }}>
      <h1 className="text-2xl font-bold mb-4">Stock Movements</h1>
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
