import { useState } from "react";

export default function OverheadsTable({ overheads }: { overheads: any[] }) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  return (
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
              <td className="p-2">{o.category_name ?? "—"}</td>
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

            {/* Expandable row */}
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
  );
}
