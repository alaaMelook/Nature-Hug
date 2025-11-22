"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface BOMRow {
  id: number;
  material_name: string;
  grams_used: number;
  unit_cost: number;
  total_cost: number;
}

export default function VariantBomPage() {
  const params = useParams();
  const id = params.id as string;

  const [rows, setRows] = useState<BOMRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/bom/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRows(data.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleEdit = async (rowId: number, currentGrams: number) => {
    const newGrams = prompt("Enter new grams:", currentGrams.toString());
    if (!newGrams) return;

    const res = await fetch(`/api/admin/bom/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rowId, grams_used: parseFloat(newGrams) }),
    });

    const data = await res.json();
    if (data.success) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === rowId
            ? { ...r, grams_used: parseFloat(newGrams), total_cost: parseFloat(newGrams) * r.unit_cost }
            : r
        )
      );
    }
  };

  const handleDelete = async (rowId: number) => {
    if (!confirm("Are you sure?")) return;

    const res = await fetch(`/api/admin/bom/${rowId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setRows((prev) => prev.filter((r) => r.id !== rowId));
    }
  };

  const totalCost = rows.reduce((sum, r) => sum + r.total_cost, 0);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Variant BOM</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Material</th>
            <th className="p-2">Grams</th>
            <th className="p-2">Unit Cost</th>
            <th className="p-2">Total Cost</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t">
              <td className="p-2">{row.material_name}</td>
              <td className="p-2">{row.grams_used}</td>
              <td className="p-2">{row.unit_cost.toFixed(2)}</td>
              <td className="p-2">{row.total_cost.toFixed(2)}</td>
              <td className="p-2 flex gap-2">
                <button
                  className="text-blue-600 underline"
                  onClick={() => handleEdit(row.id, row.grams_used)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 underline"
                  onClick={() => handleDelete(row.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-bold">
            <td className="p-2" colSpan={3}>Total BOM Cost</td>
            <td className="p-2">{totalCost.toFixed(2)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
