"use client";

import { useEffect, useState } from "react";

type Partner = {
  id: number;
  name?: string | null;
  contribution_amount?: number | null;
  ownership_percentage?: number | null;
  created_at?: string | null;
};

type Contribution = {
  id: number;
  partner_id: number;
  amount?: number | null;
  created_at?: string | null;
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPartners();
    fetchContributions();
  }, []);

  const fetchPartners = async () => {
    const res = await fetch("/api/admin/finance/partners");
    const data = await res.json();
    setPartners(Array.isArray(data) ? data : []);
  };

  const fetchContributions = async () => {
    const res = await fetch("/api/admin/finance/contributions");
    const data = await res.json();
    setContributions(Array.isArray(data) ? data : []);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا الشريك؟")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/finance/partners?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setPartners(partners.filter((p) => p.id !== id));
    } else {
      alert("حدث خطأ أثناء الحذف");
    }
    setLoading(false);
  };

  // جمع المساهمات مع معالجة NaN أو undefined أو أي قيمة غير رقمية
  const getTotalContribution = (partner: Partner) => {
    const partnerContributions = contributions.filter(
      (c) => c.partner_id === partner.id
    );
    const mainAmount = Number(partner.contribution_amount) || 0;
    const added = partnerContributions.reduce(
      (sum, c) => sum + (Number(c.amount) || 0), 0
    );
    const total = mainAmount + added;
    return isNaN(total) ? "—" : total.toString();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Partners</h1>
      <div className="flex gap-2 mb-4">
        <a
          href="/admin/finance/partners/new"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Partner
        </a>
        <a
          href="/admin/finance/partners/report"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Report
        </a>
        <a
          href="/admin/finance/partners/summary"
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Summary
        </a>
      </div>
      <table className="w-full mt-6 border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Contribution</th>
            <th className="p-2 border">Ownership %</th>
            <th className="p-2 border">Created</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {partners.length === 0 && (
            <tr>
              <td className="p-2 border text-center" colSpan={6}>No partners found</td>
            </tr>
          )}
          {partners.map((partner) => (
            <tr key={partner.id} className="border">
              <td className="p-2 border">{partner.id ?? "—"}</td>
              <td className="p-2 border">
                {partner.name ? (
                  <a
                    href={`/admin/finance/partners/${partner.id}`}
                    className="text-blue-600 underline"
                  >
                    {partner.name}
                  </a>
                ) : "—"}
              </td>
              <td className="p-2 border">{getTotalContribution(partner)}</td>
              <td className="p-2 border">
                {partner.ownership_percentage !== undefined && partner.ownership_percentage !== null
                  ? `${partner.ownership_percentage}%`
                  : "—"}
              </td>
              <td className="p-2 border">
                {partner.created_at
                  ? new Date(partner.created_at).toLocaleDateString()
                  : "—"}
              </td>
              <td className="p-2 border">
                <a
                  href={`/admin/finance/partners/${partner.id}/edit`}
                  className="bg-yellow-400 text-white px-2 py-1 rounded mr-2"
                >
                  Edit
                </a>
                <button
                  onClick={() => handleDelete(partner.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  disabled={loading}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}