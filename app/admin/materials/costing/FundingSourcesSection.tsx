"use client";

import { useEffect, useState } from "react";

type FundingSource = {
  id: number;
  source_type: string;
  amount: number;
  terms?: string | null;
};

export default function FundingSourcesSection() {
  const [sources, setSources] = useState<FundingSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ source_type: "", amount: "", terms: "" });

  const fetchSources = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/funding");
    const json = await res.json();
    if (json.ok) setSources(json.data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/funding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_type: form.source_type,
        amount: Number(form.amount),
        terms: form.terms,
      }),
    });
    setForm({ source_type: "", amount: "", terms: "" });
    setShowForm(false);
    fetchSources();
  };

  useEffect(() => {
    fetchSources();
  }, []);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Funding Sources</h2>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          {showForm ? "Cancel" : "Add Source"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 space-y-2 border p-4 rounded">
          <input
            placeholder="Source Type"
            className="border px-2 py-1 rounded w-full"
            value={form.source_type}
            onChange={(e) => setForm({ ...form, source_type: e.target.value })}
          />
          <input
            type="number"
            placeholder="Amount"
            className="border px-2 py-1 rounded w-full"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <input
            placeholder="Terms (optional)"
            className="border px-2 py-1 rounded w-full"
            value={form.terms}
            onChange={(e) => setForm({ ...form, terms: e.target.value })}
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : sources.length === 0 ? (
        <p className="text-gray-500">No sources yet</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 border">Source</th>
              <th className="px-2 py-1 border">Amount</th>
              <th className="px-2 py-1 border">Terms</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id}>
                <td className="px-2 py-1 border">{s.source_type}</td>
                <td className="px-2 py-1 border">{s.amount}</td>
                <td className="px-2 py-1 border">{s.terms ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
