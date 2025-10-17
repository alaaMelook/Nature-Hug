"use client";
import { useEffect, useState } from "react";

export default function ExpensesTable() {
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/finance/expenses")
      .then((res) => res.json())
      .then(setExpenses);
  }, []);

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">قائمة المصروفات</h2>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">النوع</th>
            <th className="p-2 border">الاسم</th>
            <th className="p-2 border">المبلغ</th>
            <th className="p-2 border">العملة</th>
            <th className="p-2 border">الحالة</th>
            <th className="p-2 border">الشريك</th>
            <th className="p-2 border">الوصف</th>
            <th className="p-2 border">التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td className="p-2 border">{e.type}</td>
              <td className="p-2 border">{e.item_name}</td>
              <td className="p-2 border">{e.amount}</td>
              <td className="p-2 border">{e.currency}</td>
              <td className="p-2 border">{e.status}</td>
              <td className="p-2 border">{e.paid_by_partner_id ?? "-"}</td>
              <td className="p-2 border">{e.description}</td>
              <td className="p-2 border">{new Date(e.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
