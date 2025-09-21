export default function CostingPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">حساب تكلفة المنتج</h1>
      <form className="mb-6">
        <div className="mb-4">
          <label className="block mb-1">اختيار المنتج</label>
          <select className="border px-2 py-1 rounded w-full">
            <option>ستوك كريم</option>
            <option>شامبو طبيعي</option>
          </select>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Calculate Cost</button>
      </form>
      <table className="min-w-full border text-sm mb-8">
        <thead>
          <tr>
            <th>الخامة</th>
            <th>الكمية المطلوبة</th>
            <th>سعر الوحدة</th>
            <th>التكلفة الجزئية</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>لبن</td>
            <td>500 جرام</td>
            <td>0.10</td>
            <td>50</td>
          </tr>
          <tr>
            <td>سكر</td>
            <td>100 جرام</td>
            <td>0.05</td>
            <td>5</td>
          </tr>
        </tbody>
      </table>
      <div className="mb-4">
        <label>تكاليف إضافية:</label>
        <input type="number" className="border px-2 py-1 rounded w-full" placeholder="عمالة، كهرباء ..." />
      </div>
      <div className="font-bold mb-4">إجمالي التكلفة: 100 جنيه</div>
      <div className="mb-4">
        <label>سعر البيع المقترح:</label>
        <input type="number" className="border px-2 py-1 rounded w-full" />
      </div>
      <div className="font-bold">نسبة الربح: 20% | صافي الربح: 20 جنيه</div>
    </div>
  );
}