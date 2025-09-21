export default function MovementsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">سجل الحركات</h1>
      <div className="mb-4">
        <input type="date" className="border px-2 py-1 rounded mr-2" />
        <select className="border px-2 py-1 rounded">
          <option>كل الحركات</option>
          <option>إضافة</option>
          <option>خصم</option>
          <option>إنتاج</option>
        </select>
        <button className="bg-gray-600 text-white px-3 py-1 rounded ml-2">بحث</button>
      </div>
      <table className="min-w-full border text-sm">
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>نوع الحركة</th>
            <th>المادة/المنتج</th>
            <th>الكمية</th>
            <th>المستخدم</th>
            <th>ملاحظات</th>
            <th>مستند</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2024-09-10</td>
            <td>إضافة</td>
            <td>زبدة الشيا</td>
            <td>10 كجم</td>
            <td>أحمد</td>
            <td>فاتورة شراء</td>
            <td><button className="text-blue-600">عرض pdf</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}