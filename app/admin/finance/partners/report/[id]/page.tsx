"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PartnerReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const fetchReport = async () => {
    if (!id) return;
    const params = new URLSearchParams({
      partner_id: id as string,
      ...(periodStart && { start: periodStart }),
      ...(periodEnd && { end: periodEnd }),
    });

    const res = await fetch(`/api/admin/finance/partners/report?${params.toString()}`);
    const data = await res.json();
    setReport(data);
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Partner Report</h1>

      <div className="flex gap-4 items-end">
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
        <button
          onClick={fetchReport}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Filter
        </button>
      </div>

      {report && (
        <div className="space-y-6">
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="text-xl font-semibold">{report.partner.name}</h2>
            <p>Ownership: {report.partner.ownership_percentage}%</p>
            <p>Total Contributions: {report.totalContributions}</p>
            <p>Total Profit Share: {report.totalProfitShare}</p>
            <p
              className={`${
                report.netPosition >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              Net Position: {report.netPosition}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Contributions</h3>
            <table className="w-full border-collapse border text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Date</th>
                  <th className="border px-4 py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {report.contributions.map((c: any) => (
                  <tr key={c.id}>
                    <td className="border px-4 py-2">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="border px-4 py-2">{c.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Profit Distributions</h3>
            <table className="w-full border-collapse border text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Period</th>
                  <th className="border px-4 py-2">Profit Share</th>
                </tr>
              </thead>
              <tbody>
                {report.distributions.map((d: any) => (
                  <tr key={d.id}>
                    <td className="border px-4 py-2">
                      {d.period_start} → {d.period_end}
                    </td>
                    <td className="border px-4 py-2">{d.profit_share}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
