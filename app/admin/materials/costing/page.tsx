"use client";

import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  description?: string | null;
};

type Overhead = {
  id: number;
  name: string;
  amount: number;
  depreciation_rate?: number | null;
  notes?: string | null;
  category_id: number;
  category_name?: string;
  created_at: string;
  updated_at: string;
};

export default function CostingPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [overheads, setOverheads] = useState<Overhead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  /* ---------------- Load Data ---------------- */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, overRes] = await Promise.all([
        fetch("/api/admin/cost/categories").then((r) => r.json()),
        fetch("/api/admin/cost").then((r) => r.json()),
      ]);

      if (catRes.ok) setCategories(catRes.data);
      if (overRes.ok) setOverheads(overRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------------- Helpers ---------------- */
  const getCategoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name ?? "—";

  const totalCost = overheads.reduce((sum, o) => {
    const dep = o.depreciation_rate ? (o.amount * o.depreciation_rate) / 100 : o.amount;
    return sum + dep;
  }, 0);

  /* ---------------- Render ---------------- */
  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Costing Management</h1>

      {/* Summary */}
      <div className="mb-6 p-4 bg-gray-100 rounded-md">
        <p className="text-gray-600">Total Estimated Cost</p>
        <p className="text-xl font-bold">{totalCost.toFixed(2)} EGP</p>
      </div>

      {/* Overheads Table */}
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Depreciation</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {overheads.map((o) => (
            <>
              <tr
                key={o.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  setExpandedRow(expandedRow === o.id ? null : o.id)
                }
              >
                <td className="p-2">{o.name}</td>
                <td className="p-2">{o.amount} EGP</td>
                <td className="p-2">{getCategoryName(o.category_id)}</td>
                <td className="p-2">{o.depreciation_rate ?? 0}%</td>
                <td className="p-2">
                  <button className="text-blue-600 hover:underline">
                    Edit
                  </button>
                  <button className="ml-2 text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>

              {expandedRow === o.id && (
                <tr>
                  <td colSpan={5} className="p-4 bg-gray-50 border-t">
                    <p><strong>Notes:</strong> {o.notes ?? "—"}</p>
                    <p><strong>Created:</strong> {new Date(o.created_at).toLocaleDateString()}</p>
                    <p><strong>Updated:</strong> {new Date(o.updated_at).toLocaleDateString()}</p>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
