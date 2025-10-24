"use client";
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/data/datasources/supabase/client";

;
type Order = {
  id: number;
  created_at: string;
  status: string;
  total: number;
  note?: string | null;
  created_by_admin: string | null;
  customer_id: number;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_governorate: string | null;
};

type OrderProduct = {
  order_id: number;
  product_name: string;
  quantity: number;
  price: number;
};

function AddOrderModal({
  onClose,
  onSaved,
  adminName,
}: {
  onClose: () => void;
  onSaved: () => void;
  adminName: string;
}) {
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    customer_governorate: "",
    total: "",
    status: "pending",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.customer_name || !form.customer_phone || !form.total) {
      alert("Please fill required fields (name, phone, total)");
      return;
    }
    setSaving(true);

    // 1. حفظ العميل
    const { data: custData, error: custError } = await supabase
      .from("customers")
      .insert([{ name: form.customer_name, phone: form.customer_phone }])
      .select();

    if (custError) { alert(custError.message); setSaving(false); return; }
    const customerId = custData?.[0]?.id;

    // 2. حفظ العنوان
    await supabase
      .from("customer_addresses")
      .insert([{ customer_id: customerId, address: form.customer_address, governorate: form.customer_governorate }]);

    // 3. حفظ الأوردر
    await supabase
      .from("orders")
      .insert([
        {
          customer_id: customerId,
          status: form.status,
          total: Number(form.total),
          note: form.note,
          created_by_admin: adminName,
        }
      ]);

    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded max-w-md w-full shadow-lg p-6">
        <h2 className="text-lg font-bold mb-4">Add Order</h2>
        <input
          type="text"
          placeholder="Customer Name"
          value={form.customer_name}
          onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
          className="border px-3 py-2 rounded w-full mb-3"
        />
        <input
          type="text"
          placeholder="Phone"
          value={form.customer_phone}
          onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
          className="border px-3 py-2 rounded w-full mb-3"
        />
        <input
          type="text"
          placeholder="Address"
          value={form.customer_address}
          onChange={(e) => setForm({ ...form, customer_address: e.target.value })}
          className="border px-3 py-2 rounded w-full mb-3"
        />
        <input
          type="text"
          placeholder="Governorate"
          value={form.customer_governorate}
          onChange={(e) =>
            setForm({ ...form, customer_governorate: e.target.value })
          }
          className="border px-3 py-2 rounded w-full mb-3"
        />
        <input
          type="number"
          placeholder="Total"
          value={form.total}
          onChange={(e) => setForm({ ...form, total: e.target.value })}
          className="border px-3 py-2 rounded w-full mb-3"
        />
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="border px-3 py-2 rounded w-full mb-3"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
          <option value="refunded">Refunded</option>
        </select>
        <textarea
          placeholder="Note"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          className="border px-3 py-2 rounded w-full mb-3"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={saving}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ExportModal({
  onClose,
  onExport,
}: {
  onClose: () => void;
  onExport: (status: string) => void;
}) {
  const [status, setStatus] = useState("pending");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded max-w-sm w-full shadow-lg p-6">
        <h2 className="text-lg font-bold mb-4">Export Orders</h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border px-3 py-2 rounded w-full mb-4"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
          <option value="refunded">Refunded</option>
        </select>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => onExport(status)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailsModal({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-white rounded max-w-3xl w-full shadow-lg overflow-auto max-h-[90vh] p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-2">Order #{order.id}</h2>
        <div className="mb-4">
          <p>
            <strong>Status:</strong> {order.status ?? "-"}
          </p>
          <p>
            <strong>Total:</strong> {order.total ?? "0.00"}
          </p>
          <p>
            <strong>Created:</strong>{" "}
            {order ? new Date(order.created_at).toLocaleString() : "-"}
          </p>
          <p>
            <strong>Note:</strong> {order.note ?? "-"}
          </p>
          <p>
            <strong>Admin:</strong> {order.created_by_admin ?? "-"}
          </p>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold">Customer</h3>
          <p>{order.customer_name ?? "-"}</p>
          <p className="text-sm text-gray-600">{order.customer_phone ?? "-"}</p>
          <p className="text-sm text-gray-600">{order.customer_address ?? "-"}</p>
          <p className="text-sm text-gray-600">
            Governorate: {order.customer_governorate ?? "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AllOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const limit = 10;
  const adminName = "AdminName";

  // جلب الطلبات مع العميل والعنوان
  const fetchOrders = async () => {
    setLoading(true);
    let q: any = supabase
      .from("orders")
      .select(`
        id, created_at, status, total, note, created_by_admin, customer_id,
        customers (name, phone),
        customer_addresses (address, governorate)
      `)
      .order("created_at", { ascending: false });
    if (statusFilter !== "all") q = q.eq("status", statusFilter);

    const { data, error } = await q;
    const mapped = (data ?? []).map((o: any) => ({
      id: o.id,
      created_at: o.created_at,
      status: o.status,
      total: o.total,
      note: o.note,
      created_by_admin: o.created_by_admin,
      customer_id: o.customer_id,
      customer_name: o.customers?.name ?? "-",
      customer_phone: o.customers?.phone ?? "-",
      customer_address: o.customer_addresses?.[0]?.address ?? "-",
      customer_governorate: o.customer_addresses?.[0]?.governorate ?? "-",
    }));
    setOrders(mapped);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, sort, page]);

  // تصدير الطلبات
  const handleExport = async (status: string) => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id, status, created_at, note, created_by_admin, customer_id,
        customers (name, phone),
        customer_addresses (address, governorate)
      `)
      .eq("status", status);

    const mapped = (data ?? []).map((o: any) => [
      o.id,
      o.status,
      new Date(o.created_at).toLocaleString(),
      o.customers?.name ?? "-",
      o.customers?.phone ?? "-",
      o.customer_addresses?.[0]?.address ?? "-",
      o.customer_addresses?.[0]?.governorate ?? "-",
      o.note ?? "-",
      o.created_by_admin ?? "-",
    ]);

    const headers = [
      "Order ID",
      "Status",
      "Created At",
      "Customer Name",
      "Customer Phone",
      "Address",
      "Governorate",
      "Note",
      "Admin",
    ];

    const csvContent = [headers, ...mapped]
      .map((row) =>
        row
          .map((cell: any) => {
            const s = String(cell ?? "");
            if (s.includes(",") || s.includes('"') || s.includes("\n")) {
              return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orders_${status}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportModal(false);
  };

  if (loading) return <p className="p-6">Loading orders...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Orders</h1>
      <button
        onClick={() => setShowAddModal(true)}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
      >
        + Add Order
      </button>
      <button
        onClick={() => setShowExportModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4 ml-2"
      >
        Export Orders
      </button>
      {showAddModal && (
        <AddOrderModal
          onClose={() => setShowAddModal(false)}
          onSaved={fetchOrders}
          adminName={adminName}
        />
      )}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
        />
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="border px-3 py-2 rounded w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="total_desc">Total (High → Low)</option>
          <option value="total_asc">Total (Low → High)</option>
        </select>
      </div>

      {/* Table */}
      <table className="min-w-full border border-gray-200 rounded-md text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left border-b">ID</th>
            <th className="px-4 py-2 text-left border-b">Customer Name</th>
            <th className="px-4 py-2 text-left border-b">Phone</th>
            <th className="px-4 py-2 text-left border-b">Address</th>
            <th className="px-4 py-2 text-left border-b">Governorate</th>
            <th className="px-4 py-2 text-left border-b">Status</th>
            <th className="px-4 py-2 text-left border-b">Total</th>
            <th className="px-4 py-2 text-left border-b">Note</th>
            <th className="px-4 py-2 text-left border-b">Admin</th>
            <th className="px-4 py-2 text-left border-b">Created At</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <td className="px-4 py-2 border-b">{order.id}</td>
                <td className="px-4 py-2 border-b">{order.customer_name}</td>
                <td className="px-4 py-2 border-b">{order.customer_phone}</td>
                <td className="px-4 py-2 border-b">{order.customer_address}</td>
                <td className="px-4 py-2 border-b">{order.customer_governorate}</td>
                <td className="px-4 py-2 border-b">{order.status}</td>
                <td className="px-4 py-2 border-b">{order.total}</td>
                <td className="px-4 py-2 border-b">{order.note ?? "—"}</td>
                <td className="px-4 py-2 border-b">{order.created_by_admin ?? "—"}</td>
                <td className="px-4 py-2 border-b">{new Date(order.created_at).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={10}
                className="px-4 py-6 text-center text-gray-500"
              >
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {/* ... يمكنك إضافة كود Pagination هنا إذا كنت تحتاجه ... */}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}