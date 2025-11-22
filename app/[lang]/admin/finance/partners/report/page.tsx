"use client";

import { useEffect, useState } from "react";

type Partner = { id: number; name: string };

export default function PartnerReportPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string>("");
  const [report, setReport] = useState<any>(null);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  useEffect(() => {
    const fetchPartners = async () => {
      const res = await fetch("/api/admin/finance/partners");
      const data = await res.json();
      setPartners(data);
    };
    fetchPartners();
  }, []);

  const handleFetchReport = async () => {
    if (!selectedPartner) return;
    const params = new URLSearchParams({
      partner_id: selectedPartner,
      ...(periodStart && { start: periodStart }),
      ...(periodEnd && { end: periodEnd }),
    });

    const res = await fetch(`/api/admin/finance/partners/report?${params.toString()}`);
    const data = await res.json();
    setReport(data);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Partner Report</h1>

      <div>
        <label className="block mb-1">Select Partner</label>
        <select
          value={selectedPartner}
          onChange={(e) => setSelectedPartner(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">-- choose --</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

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

      <button
        onClick={handleFetchReport}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Generate Report
      </button>

      {report && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">{report.partner.name}</h2>
          <p>Ownership: {report.partner.ownership_percentage}%</p>
          <p>Total Contributions: {report.totalContributions}</p>
          <p>Total Profit Share: {report.totalProfitShare}</p>
          <p className={report.netPosition >= 0 ? "text-green-600" : "text-red-600"}>
            Net Position: {report.netPosition}
          </p>

          <h3 className="text-lg font-semibold mt-4">Contributions</h3>
          <ul className="list-disc pl-6">
            {report.contributions.map((c: any) => (
              <li key={c.id}>
                {new Date(c.created_at).toLocaleDateString()} - {c.amount}
              </li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold mt-4">Profit Distributions</h3>
          <ul className="list-disc pl-6">
            {report.distributions.map((d: any) => (
              <li key={d.id}>
                {d.period_start} → {d.period_end}: {d.profit_share}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
