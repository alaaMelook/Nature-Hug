"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Partner = {
  id: number;
  name: string;
  contribution_amount: number;
  ownership_percentage: number;
  created_at: string;
};

type Contribution = {
  id: number;
  partner_id: number;
  amount: number;
  created_at: string;
};

export default function PartnerDetailPage() {
  const params = useParams();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // fetch partner
  useEffect(() => {
    const fetchPartner = async () => {
      const res = await fetch(`/api/admin/finance/partners?id=${params.id}`);
      const data = await res.json();
      setPartner(data);
    };
    if (params.id) fetchPartner();
  }, [params.id]);

  // fetch contributions
  useEffect(() => {
    const fetchContributions = async () => {
      const res = await fetch(`/api/admin/finance/contributions?partner_id=${params.id}`);
      const data = await res.json();
      setContributions(Array.isArray(data) ? data : []);
    };
    if (params.id) fetchContributions();
  }, [params.id]);

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/finance/contributions", {
      method: "POST",
      body: JSON.stringify({
        partner_id: params.id,
        amount: parseFloat(amount)
      }),
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      setAmount("");
      const newContribution = await res.json();
      setContributions((prev) => [newContribution, ...prev]);
    } else {
      alert("خطأ أثناء إضافة المساهمة");
    }
    setLoading(false);
  };

  if (!partner) return <p>Loading...</p>;

  // حساب إجمالي المساهمات (المخزنة في جدول المساهمات)
  const totalContributions = contributions.reduce((sum, c) => sum + Number(c.amount), 0) + Number(partner.contribution_amount);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Partner Details</h1>
      <p><strong>ID:</strong> {partner.id}</p>
      <p><strong>Name:</strong> {partner.name}</p>
      <p><strong>Initial Contribution:</strong> {partner.contribution_amount}</p>
      <p><strong>Ownership %:</strong> {partner.ownership_percentage}</p>
      <p><strong>Created:</strong> {new Date(partner.created_at).toLocaleDateString()}</p>
      <p className="font-semibold mt-4"><strong>Total Contributions:</strong> {totalContributions}</p>

      <hr className="my-4" />

      <form onSubmit={handleAddContribution} className="mb-4 flex gap-2">
        <input
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Add contribution amount"
          className="border px-2 py-1 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-1 rounded"
          disabled={loading}
        >
          Add Contribution
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Contributions</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(contributions) && contributions.map((c) => (
            <tr key={c.id}>
              <td className="p-2 border">{c.amount}</td>
              <td className="p-2 border">{new Date(c.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}