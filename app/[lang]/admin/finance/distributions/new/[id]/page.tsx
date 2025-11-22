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

export default function DistributionDetailPage({ params }: { params: { id: string } }) {
  const [distribution, setDistribution] = useState<Distribution | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/admin/distributions?id=${params.id}`);
      const data = await res.json();
      setDistribution(data);
    };
    fetchData();
  }, [params.id]);

  if (!distribution) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Distribution Details</h1>
      <p><strong>ID:</strong> {distribution.id}</p>
      <p><strong>Partner ID:</strong> {distribution.partner_id}</p>
      <p><strong>Period:</strong> {distribution.period_start} → {distribution.period_end}</p>
      <p><strong>Profit Share:</strong> {distribution.profit_share}</p>
      <p><strong>Created:</strong> {new Date(distribution.created_at).toLocaleDateString()}</p>
    </div>
  );
}
