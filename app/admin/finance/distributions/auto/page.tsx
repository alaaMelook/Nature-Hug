"use client";

import { useState } from "react";

type DistributionResult = {
  id: number;
  partner_id: number;
  profit_share: number;
  period_start: string;
  period_end: string;
};

export default function AutoDistributionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const handleDistribute = async (save: boolean) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/finance/distributions/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period_start: periodStart,
          period_end: periodEnd,
          save, // ممكن تستخدم الفلاج ده في الـ API لو عايزة Preview فقط
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Automatic Profit Distribution</h1>

      {/* الفترة الزمنية */}
      <div className="flex gap-4 items-center">
        <div>
          <label className="block text-sm">Period Start</label>
          <input
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block text-sm">Period End</label>
          <input
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
      </div>

      {/* الأزرار */}
      <div className="flex gap-4">
        <button
          onClick={() => handleDistribute(false)}
          disabled={loading}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          {loading ? "Calculating..." : "Preview"}
        </button>
        <button
          onClick={() => handleDistribute(true)}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Saving..." : "Distribute & Save"}
        </button>
      </div>

      {/* النتائج */}
      {result && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Results</h2>
          <p>Total Revenue: {result.totalRevenue}</p>
          <p>Total Overheads: {result.totalOverheads}</p>
          <p>Total Purchases: {result.totalPurchases}</p>
          <p className="font-bold">Net Profit: {result.netProfit}</p>

          <h3 className="text-lg font-semibold mt-4">Distributions</h3>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Partner ID</th>
                <th className="border px-2 py-1">Profit Share</th>
                <th className="border px-2 py-1">Period</th>
              </tr>
            </thead>
            <tbody>
              {result.distributions?.map((d: DistributionResult) => (
                <tr key={d.partner_id}>
                  <td className="border px-2 py-1">{d.partner_id}</td>
                  <td className="border px-2 py-1">{d.profit_share}</td>
                  <td className="border px-2 py-1">
                    {d.period_start} → {d.period_end}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
