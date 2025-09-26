"use client";
import { useEffect, useState } from "react";

export default function ExpenseTypesPage() {
  const [types, setTypes] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState({ name: "", depreciation_rate: 0 });

  const fetchTypes = async () => {
    const res = await fetch("/api/admin/finance/expense-types");
    const data = await res.json();
    setTypes(data);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  // ✅ إضافة نوع جديد
  const handleAdd = async () => {
   if (!newType.name) {
    alert("⚠️ لازم تدخل اسم النوع");
    return;
  }

  const res = await fetch("/api/admin/finance/expense-types", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newType),
  });

  const data = await res.json();

  if (res.ok) {
    setAdding(false);
    setNewType({ name: "", depreciation_rate: 0 });
    fetchTypes();
  } else {
    alert("❌ خطأ: " + (data.error || "حاول تاني"));
  }
};

  // ✅ حذف نوع
  const handleDelete = async (id: number) => {
    if (!confirm("❌ هل متأكد من حذف النوع؟")) return;
    const res = await fetch(`/api/admin/finance/expense-types/${id}`, { method: "DELETE" });
    if (res.ok) setTypes(types.filter((t) => t.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">⚙️ إدارة أنواع المصروفات</h1>

      <button
        onClick={() => setAdding(true)}
        className="bg-green-600 text-white px-4 py-2 rounded shadow"
      >
        ➕ إضافة نوع
      </button>

      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-2">📑 قائمة الأنواع</h2>
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">الاسم</th>
              <th className="p-2 border">نسبة الاستهلاك السنوي (%)</th>
              <th className="p-2 border">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t.id}>
                <td className="p-2 border">{t.name}</td>
                <td className="p-2 border">{t.depreciation_rate ?? 0}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleDelete(t.id)}
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

      {/* نافذة إضافة نوع */}
      {adding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg space-y-4 w-96">
            <h2 className="text-lg font-semibold">➕ إضافة نوع جديد</h2>

            <input
              type="text"
              placeholder="اسم النوع"
              value={newType.name}
              onChange={(e) => setNewType({ ...newType, name: e.target.value })}
              className="border p-2 rounded w-full"
            />

            <input
              type="number"
              placeholder="نسبة الاستهلاك (%)"
              value={newType.depreciation_rate}
              onChange={(e) =>
                setNewType({ ...newType, depreciation_rate: Number(e.target.value) })
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
    </div>
  );
}
