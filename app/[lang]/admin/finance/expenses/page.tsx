"use client";
import { useEffect, useState } from "react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [adding, setAdding] = useState(false);

  const [newExpense, setNewExpense] = useState<any>({
    type_id: "",
    item_name: "",
    amount: 0,
    currency: "EGP",
    status: "paid",
    description: "",
    paid_by_partner_id: null,
  });

  const fetchExpenses = async () => {
    const res = await fetch("/api/admin/finance/expenses");
    const data = await res.json();
    setExpenses(data);
  };

  useEffect(() => {
    fetchExpenses();
    fetch("/api/admin/finance/partners").then((res) => res.json()).then(setPartners);
    fetch("/api/admin/finance/expense-types").then((res) => res.json()).then(setTypes);
  }, []);

  // ✅ إضافة مصروف جديد
  const handleAdd = async () => {
    const res = await fetch("/api/admin/finance/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newExpense),
    });

    if (res.ok) {
      setAdding(false);
      setNewExpense({
        type_id: "",
        item_name: "",
        amount: 0,
        currency: "EGP",
        status: "paid",
        description: "",
        paid_by_partner_id: null,
      });
      fetchExpenses();
    }
  };

  // ✅ حذف مصروف
  const handleDelete = async (id: number) => {
    if (!confirm("❌ هل متأكد من حذف هذا المصروف؟")) return;
    const res = await fetch(`/api/admin/finance/expenses/${id}`, { method: "DELETE" });
    if (res.ok) setExpenses(expenses.filter((e) => e.id !== id));
  };

  // ✅ تعديل مصروف
  const handleUpdate = async () => {
    if (!editing) return;
    const res = await fetch(`/api/admin/finance/expenses/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      setEditing(null);
      fetchExpenses();
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">📊 إدارة المصروفات</h1>

      {/* ✅ زر إضافة */}
      <button
        onClick={() => setAdding(true)}
        className="bg-green-600 text-white px-4 py-2 rounded shadow"
      >
        ➕ إضافة مصروف
      </button>

      {/* ✅ جدول المصروفات */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-2">📑 قائمة المصروفات</h2>
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">النوع</th>
              <th className="p-2 border">الاسم</th>
              <th className="p-2 border">المبلغ</th>
              <th className="p-2 border">العملة</th>
              <th className="p-2 border">الحالة</th>
              <th className="p-2 border">الشريك</th>
              <th className="p-2 border">الاستهلاك السنوي</th>
              <th className="p-2 border">الاستهلاك الشهري</th>
              <th className="p-2 border">الوصف</th>
              <th className="p-2 border">التاريخ</th>
              <th className="p-2 border">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td className="p-2 border">{e.expense_types?.name}</td>
                <td className="p-2 border">{e.item_name}</td>
                <td className="p-2 border">{e.amount}</td>
                <td className="p-2 border">{e.currency}</td>
                <td className="p-2 border">{e.status}</td>
                <td className="p-2 border">
                  {partners.find((p) => p.id === e.paid_by_partner_id)?.name ?? "-"}
                </td>
                <td className="p-2 border">{e.annual_depreciation ?? "-"}</td>
                <td className="p-2 border">{e.monthly_depreciation ?? "-"}</td>
                <td className="p-2 border">{e.description}</td>
                <td className="p-2 border">
                  {new Date(e.created_at).toLocaleDateString()}
                </td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => setEditing(e)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ نافذة إضافة */}
      {adding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg space-y-4 w-96">
            <h2 className="text-lg font-semibold">➕ إضافة مصروف جديد</h2>

            {/* Dropdown للنوع */}
            <select
              value={newExpense.type_id}
              onChange={(e) =>
                setNewExpense({ ...newExpense, type_id: e.target.value })
              }
              className="border p-2 rounded w-full"
            >
              <option value="">-- اختر النوع --</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.depreciation_rate ?? 0}% استهلاك)
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="اسم المصروف"
              value={newExpense.item_name}
              onChange={(e) =>
                setNewExpense({ ...newExpense, item_name: e.target.value })
              }
              className="border p-2 rounded w-full"
            />

            <input
              type="text" inputMode="numeric" pattern="[0-9]*"

              placeholder="المبلغ"
              value={newExpense.amount}
              onChange={(e) =>
                setNewExpense({ ...newExpense, amount: Number(e.target.value) })
              }
              className="border p-2 rounded w-full"
            />

            <select
              value={newExpense.currency}
              onChange={(e) =>
                setNewExpense({ ...newExpense, currency: e.target.value })
              }
              className="border p-2 rounded w-full"
            >
              <option value="EGP">جنيه مصري</option>
              <option value="USD">دولار</option>
              <option value="EUR">يورو</option>
            </select>

            <select
              value={newExpense.status}
              onChange={(e) =>
                setNewExpense({ ...newExpense, status: e.target.value })
              }
              className="border p-2 rounded w-full"
            >
              <option value="paid">مدفوع</option>
              <option value="pending">قيد التنفيذ</option>
              <option value="expected">متوقع</option>
            </select>

            <select
              value={newExpense.paid_by_partner_id ?? ""}
              onChange={(e) =>
                setNewExpense({
                  ...newExpense,
                  paid_by_partner_id: e.target.value,
                })
              }
              className="border p-2 rounded w-full"
            >
              <option value="">-- اختر شريك --</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <textarea
              placeholder="وصف المصروف"
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense({ ...newExpense, description: e.target.value })
              }
              className="border p-2 rounded w-full"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setAdding(false)}
                className="bg-gray-500 text-white px-3 py-1 rounded"
              >
                إلغاء
              </button>
              <button
                onClick={handleAdd}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ نافذة تعديل */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg space-y-4 w-96">
            <h2 className="text-lg font-semibold">✏️ تعديل المصروف</h2>
            <input
              type="text"
              value={editing.item_name}
              onChange={(e) =>
                setEditing({ ...editing, item_name: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
            <input
              type="text" inputMode="numeric" pattern="[0-9]*"

              value={editing.amount}
              onChange={(e) =>
                setEditing({ ...editing, amount: Number(e.target.value) })
              }
              className="border p-2 rounded w-full"
            />
            <textarea
              value={editing.description}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditing(null)}
                className="bg-gray-500 text-white px-3 py-1 rounded"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
