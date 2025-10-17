"use client";
import { useState, useEffect } from "react";

export default function ExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
  const [partners, setPartners] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    type: "asset",
    subtype: "",
    item_name: "",
    amount: 0,
    currency: "EGP",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    status: "paid",
    paid_by_partner_id: "",
    supplier_id: "",
    linked_order_id: "",
    depreciation_rate: 0,
    tags: [],
    recurring_expense: false,
    payment_method: "cash",
    vat_rate: 0,
  });

  useEffect(() => {
    fetch("/api/admin/partners")
      .then((res) => res.json())
      .then(setPartners);
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch("/api/admin/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      alert("✅ تم تسجيل المصروف");
      setForm({ ...form, item_name: "", amount: 0, description: "" });
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded shadow">
      <h2 className="text-lg font-semibold">إضافة مصروف جديد</h2>

      {/* نوع المصروف */}
      <div>
        <label className="block text-sm">النوع</label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border p-2 rounded w-full"
        >
          <option value="asset">أصل</option>
          <option value="marketing">دعاية</option>
          <option value="raw_material">مواد خام</option>
          <option value="furniture">أثاث</option>
          <option value="utilities">مرافق</option>
          <option value="other">أخرى</option>
        </select>
      </div>

      {/* اسم المصروف */}
      <div>
        <label className="block text-sm">اسم المصروف</label>
        <input
          type="text"
          value={form.item_name}
          onChange={(e) => setForm({ ...form, item_name: e.target.value })}
          className="border p-2 rounded w-full"
          placeholder="مثال: حملة فيسبوك / كرسي مكتب"
        />
      </div>

      {/* المبلغ */}
      <div>
        <label className="block text-sm">المبلغ</label>
        <input
          type="number"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* العملة */}
      <div>
        <label className="block text-sm">العملة</label>
        <select
          value={form.currency}
          onChange={(e) => setForm({ ...form, currency: e.target.value })}
          className="border p-2 rounded w-full"
        >
          <option value="EGP">EGP</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>

      {/* الشريك */}
      <div>
        <label className="block text-sm">الشريك (لو دفع)</label>
        <select
          value={form.paid_by_partner_id}
          onChange={(e) => setForm({ ...form, paid_by_partner_id: e.target.value })}
          className="border p-2 rounded w-full"
        >
          <option value="">-- اختر الشريك --</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* الوصف */}
      <div>
        <label className="block text-sm">الوصف</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 rounded w-full"
        />
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        إضافة
      </button>
    </form>
  );
}
