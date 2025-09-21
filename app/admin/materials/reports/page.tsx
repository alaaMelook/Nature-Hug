export default function ReportsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">التقارير والتحليلات</h1>
      <div className="mb-4">قيمة الخامات في المخزن: <span className="font-bold">15000 جنيه</span></div>
      <div className="mb-4">المواد الأكثر استهلاكًا: <span className="font-bold">زبدة الشيا</span></div>
      <div className="mb-4">المنتجات الأكثر إنتاجًا: <span className="font-bold">ستوك كريم</span></div>
      {/* يمكن إضافة Charts هنا */}
      <div className="mt-6">
        <button className="bg-blue-600 text-white px-4 py-2 rounded mr-2">Export PDF</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded">Export Excel</button>
      </div>
    </div>
  );
}