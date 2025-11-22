"use client";

import { useEffect, useState } from "react";

type Distribution = {
  id: number;
  partner_id: number;
  period_start: string;
  period_end: string;
  profit_share: number;
  created_at: string;
};

export default function DistributionsPage() {
  const [distributions, setDistributions] = useState<Distribution[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/admin/finance/distributions");
      const data = await res.json();
      setDistributions(data);
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Partner Distributions</h1>
      <a
        href="/admin/finance/distributions/new"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Distribution
      </a>

      <table className="w-full mt-6 border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Partner ID</th>
            <th className="p-2 border">Period</th>
            <th className="p-2 border">Profit Share</th>
            <th className="p-2 border">Created</th>
          </tr>
        </thead>
        <tbody>
          {distributions.map((dist) => (
            <tr key={dist.id} className="border">
              <td className="p-2 border">
                <a
                  href={`/admin/finance/distributions/${dist.id}`}
                  className="text-blue-600 underline"
                >
                  {dist.id}
                </a>
              </td>
              <td className="p-2 border">{dist.partner_id}</td>
              <td className="p-2 border">
                {dist.period_start} → {dist.period_end}
              </td>
              <td className="p-2 border">{dist.profit_share}</td>
              <td className="p-2 border">
                {new Date(dist.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
