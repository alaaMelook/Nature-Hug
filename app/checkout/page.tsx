"use client";

import { useState } from "react";

const governorates = [
  "Cairo",
  "Alexandria",
  "Giza",
  "Dakahlia",
  "Sharqia",
  "Qalyubia",
  "Monufia",
  "Gharbia",
  "Beheira",
  "Kafr El Sheikh",
  "Other",
];

export default function CheckoutPage() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    governorate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data.success) {
      alert("تم الحفظ والانتقال للدفع ✅");
      // تقدر تعملي redirect لـ payment page بعدين
    } else {
      alert("حصل خطأ ❌");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Address"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email (optional)"
          className="w-full border p-2 rounded"
        />
        <select
          name="governorate"
          value={form.governorate}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Governorate</option>
          {governorates.map((gov) => (
            <option key={gov} value={gov}>
              {gov}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full bg-brown-600 text-white py-2 rounded hover:bg-brown-700"
        >
          Confirm Checkout
        </button>
      </form>
    </div>
  );
}
