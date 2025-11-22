"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/data/datasources/supabase/client";
import { useTranslation } from "react-i18next";

type Review = {
  id: number;
  product_id: number;
  customer_id: number;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
  products?: { name_english: string };
  customers?: { name: string };
};

const statusOptions = [
  { value: "approved", label: "approved" },
  { value: "rejected", label: "rejected" },
  { value: "pending", label: "pending" }
];

export default function AdminReviewsTable() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب المراجعات مع اسم المنتج واسم العميل
  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*, products(name_english), customers(name)")
      .order("created_at", { ascending: false });
    if (!error && data) setReviews(data as Review[]);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  // تحديث الحالة عند تغيير الـdropdown
  const handleStatusChange = async (id: number, newStatus: string) => {
    await supabase.from("reviews").update({ status: newStatus }).eq("id", id);
    fetchReviews();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reviews Moderation</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full border rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Rating</th>
              <th className="px-4 py-2 text-left">Comment</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length > 0 ? reviews.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">{r.products?.name_english || r.product_id}</td>
                <td className="px-4 py-2">{r.customers?.name || r.customer_id}</td>
                <td className="px-4 py-2">{r.rating} <span style={{ color: "#e2b007" }}>★</span></td>
                <td className="px-4 py-2">{r.comment}</td>
                <td className="px-4 py-2">{t('{{date, datetime}}', { date: new Date(r.created_at) })}</td>
                <td className="px-4 py-2 text-center">
                  <select
                    value={r.status}
                    onChange={e => handleStatusChange(r.id, e.target.value)}
                    className={`px-2 py-1 text-xs rounded-full border ${r.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : r.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                      }`}
                    style={{ minWidth: "100px" }}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}