export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">الإعدادات العامة</h1>
      <form>
        <div className="mb-4">
          <label>الوحدات:</label>
          <input type="text" className="border px-2 py-1 rounded w-full" placeholder="كجم، لتر، متر، قطعة" />
          <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2">+ إضافة وحدة</button>
        </div>
        <div className="mb-4">
          <label>حد الـ Low Stock الافتراضي:</label>
          <input type="number" className="border px-2 py-1 rounded w-full" placeholder="مثلا 10" />
        </div>
        <div className="mb-4">
          <label>طريقة تقييم المخزون:</label>
          <select className="border px-2 py-1 rounded w-full">
            <option>FIFO</option>
            <option>LIFO</option>
            <option>Average Cost</option>
          </select>
        </div>
        <div className="mb-4">
          <label>اسم الشركة:</label>
          <input type="text" className="border px-2 py-1 rounded w-full" />
        </div>
        <div className="mb-4">
          <label>العملة الافتراضية:</label>
          <input type="text" className="border px-2 py-1 rounded w-full" placeholder="جنيه" />
        </div>
        <div className="mb-4">
          <label>اللغة:</label>
          <select className="border px-2 py-1 rounded w-full">
            <option>عربي</option>
            <option>English</option>
          </select>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded">حفظ الإعدادات</button>
      </form>
    </div>
  );
}