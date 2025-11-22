"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/data/datasources/supabase/client";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { Order, OrderStatus } from "@/domain/entities/database/order";
import { orderStatus } from "@/lib/utils/status";
import { toTitleCase } from "@/lib/utils/titleCase";
import { it } from "node:test";
import { OrderDetailsModal } from "@/ui/components/admin/orderDetail";
import { useTranslation } from "react-i18next";


function AddOrderModal({
    onClose,
    onSaved,
    adminName,
}: {
    onClose: () => void;
    onSaved: () => void;
    adminName: string;
}) {
    const [form, setForm] = useState<Partial<Order>>({});
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!form.guest_name || !form.guest_phone) {
            alert("Please fill required fields (name, phone, total)");
            return;
        }
        setSaving(true);

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
                    value={form.guest_name}
                    onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
                    className="border px-3 py-2 rounded w-full mb-3"
                />
                <input
                    type="text"
                    placeholder="Phone"
                    value={form.guest_phone}
                    onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
                    className="border px-3 py-2 rounded w-full mb-3"
                />
                <input
                    type="text"
                    placeholder="Address"
                    value={form.guest_address?.address}
                    onChange={(e) => setForm({ ...form, guest_address: { address: e.target.value } })}
                    className="border px-3 py-2 rounded w-full mb-3"
                />
                <input
                    type="text"
                    placeholder="Governorate"
                    value={form.guest_address?.governorate_slug}
                    onChange={(e) =>
                        setForm({ ...form, guest_address: { governorate_slug: e.target.value } })
                    }
                    className="border px-3 py-2 rounded w-full mb-3"
                />

                <select
                    value={toTitleCase(form.status ?? '')}
                    onChange={(e) => setForm({ ...form, status: e.target.value as OrderStatus })}
                    className="border px-3 py-2 rounded w-full mb-3"
                >
                    {orderStatus.map((status, index) => (
                        <option key={index} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
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



export default function AllOrdersPage() {
    const [orders, setOrders] = useState<OrderDetailsView[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState<OrderDetailsView | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const { t } = useTranslation();

    const limit = 10;
    const adminName = "AdminName";
    // todo: move this to use case
    const fetchOrders = async () => {
        setLoading(true);
        let q: any = supabase.schema('admin')
            .from("order_details")
            .select('*')
            .order("order_date", { ascending: false })
        if (statusFilter !== "all") q = q.eq("order_status", statusFilter.toLowerCase());

        const { data, error } = await q;
        setOrders(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, sort, page]);

    // تصدير الطلبات
    const handleExport = async (status: string) => {


        const mapped = (orders.filter((o: any) => o.order_status === status) ?? []).map((o: any) => [
            o.id,
            o.status,
            t("{{date, datetime}}", { date: new Date(o.created_at) }),
            o.customers?.name ?? "-",
            o.customers?.phone ?? "-",
            o.guest_addresses?.[0]?.address ?? "-",
            o.guest_addresses?.[0]?.governorate ?? "-",
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
                    <option value="all">Select Status</option>
                    {orderStatus.map((stat, ind) => (
                        <option key={ind} value={stat}>
                            {stat}
                        </option>
                    ))}
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
                        <th className="px-4 py-2 text-left border-b">Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {(orders?.length ?? 0) > 0 ? (
                        orders.map((order) => (
                            <tr
                                key={order.order_id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => setSelectedOrder(order)}
                            >
                                <td className="px-4 py-2 border-b">{order.order_id}</td>
                                <td className="px-4 py-2 border-b">{order.customer_name}</td>
                                <td className="px-4 py-2 border-b text-wrap">{order.phone_numbers.toString().split(',').map((phone, index) =>
                                    <div key={index}>{phone}</div>)}</td>
                                <td className="px-4 py-2 border-b">{order.shipping_street_address}</td>
                                <td className="px-4 py-2 border-b">{order.shipping_governorate}</td>
                                <td className="px-4 py-2 border-b"> <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.order_status === "completed" ? "bg-green-100 text-green-800" : order.order_status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                                    {order.order_status}
                                </span></td>
                                <td className="px-4 py-2 border-b">{order.final_order_total} EGP</td>
                                {/*<td className="px-4 py-2 border-b">{order.note ?? "—"}</td>*/}
                                {/*<td className="px-4 py-2 border-b">{order.created_by_admin ?? "—"}</td>*/}
                                <td className="px-4 py-2 border-b">
                                    {t('{{date, datetime}}', { date: new Date(order.order_date) })}
                                    {/* {new Date(order.order_date).toLocaleString('en-GB', { timeZone: 'Africa/Cairo', hour12: true }).split(',').map((info, ind) =>
                                    <div key={ind}>{info}</div>
                                )} */}
                                </td>
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