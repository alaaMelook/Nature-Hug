"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Partner = {
  id: number;
  name: string;
};

export default function NewDistributionPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerId, setPartnerId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [profitShare, setProfitShare] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchPartners = async () => {
      const res = await fetch("/api/admin/finance/partners");
      const data = await res.json();
      setPartners(data);
    };
    fetchPartners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/finance/distributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partner_id: parseInt(partnerId),
        period_start: periodStart,
        period_end: periodEnd,
        profit_share: parseFloat(profitShare),
      }),
    });
    router.push("/admin/finance/distributions");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Distribution</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Partner</label>
          <select
            className="border p-2 w-full"
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            required
          >
            <option value="">Select Partner</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block">Period Start</label>
          <input
            type="date"
            className="border p-2 w-full"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block">Period End</label>
          <input
            type="date"
            className="border p-2 w-full"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block">Profit Share</label>
          <input
            type="text" inputMode="numeric" pattern="[0-9]*"

            className="border p-2 w-full"
            value={profitShare}
            onChange={(e) => setProfitShare(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
}
