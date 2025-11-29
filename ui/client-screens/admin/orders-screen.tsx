"use client";

import React, { useState } from "react";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { Order, OrderStatus } from "@/domain/entities/database/order";
import { orderStatus } from "@/lib/utils/status";
import { toTitleCase } from "@/lib/utils/titleCase";
import { OrderDetailsModal } from "@/ui/components/admin/orderDetail";
import { useTranslation } from "react-i18next";

function AddOrderModal({
    onClose,
    onSaved,
}: {
    onClose: () => void;
    onSaved: () => void;
}) {
    const { t } = useTranslation();
    const [form, setForm] = useState<Partial<Order>>({});
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!form.guest_name || !form.guest_phone) {
            alert(t("fillRequiredFields"));
            return;
        }
        setSaving(true);
        // TODO: Implement create order logic
        setSaving(false);
        onSaved();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded max-w-md w-full shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4">{t("addOrder")}</h2>
                <input
                    type="text"
                    placeholder={t("customerName")}
                    value={form.guest_name || ''}
                    onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
                    className="border px-3 py-2 rounded w-full mb-3"
                />
                <input
                    type="text"
                    placeholder={t("customerPhone")}
                    value={form.guest_phone || ''}
                    onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
                    className="border px-3 py-2 rounded w-full mb-3"
                />
                <input
                    type="text"
                    placeholder={t("address")}
                    value={form.guest_address?.address || ''}
                    onChange={(e) => setForm({ ...form, guest_address: { ...form.guest_address, address: e.target.value } })}
                    className="border px-3 py-2 rounded w-full mb-3"
                />
                <input
                    type="text"
                    placeholder={t("governorate")}
                    value={form.guest_address?.governorate_slug || ''}
                    onChange={(e) =>
                        setForm({ ...form, guest_address: { ...form.guest_address, governorate_slug: e.target.value } })
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
                            {t(status) || status}
                        </option>
                    ))}
                </select>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded"
                        disabled={saving}
                    >
                        {t("cancel")}
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                        disabled={saving}
                    >
                        {t("save")}
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
    const { t } = useTranslation();
    const [status, setStatus] = useState("pending");
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded max-w-sm w-full shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4">{t("exportOrders")}</h2>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border px-3 py-2 rounded w-full mb-4"
                >
                    <option value="pending">{t("pending")}</option>
                    <option value="processing">{t("processing")}</option>
                    <option value="shipped">{t("shipped")}</option>
                    <option value="delivered">{t("delivered")}</option>
                    <option value="completed">{t("completed")}</option>
                    <option value="cancelled">{t("cancelled")}</option>
                    <option value="returned">{t("returned")}</option>
                    <option value="refunded">{t("refunded")}</option>
                </select>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        onClick={() => onExport(status)}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        {t("export")}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function OrdersScreen({ initialOrders }: { initialOrders: OrderDetailsView[] }) {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<OrderDetailsView[]>(initialOrders);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sort, setSort] = useState("newest");
    const [selectedOrder, setSelectedOrder] = useState<OrderDetailsView | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (order.customer_name?.toLowerCase().includes(search.toLowerCase()) || false) ||
            (order.phone_numbers?.some(phone => phone.includes(search)) || false);
        const matchesStatus = statusFilter === "all" || order.order_status === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        if (sort === "newest") return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
        if (sort === "oldest") return new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
        if (sort === "total_desc") return b.final_order_total - a.final_order_total;
        if (sort === "total_asc") return a.final_order_total - b.final_order_total;
        return 0;
    });

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
            t("orderId"),
            t("status"),
            t("createdAt"),
            t("customerName"),
            t("customerPhone"),
            t("address"),
            t("governorate"),
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

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{t("allOrders")}</h1>
            <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
            >
                + {t("addOrder")}
            </button>
            <button
                onClick={() => setShowExportModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4 ml-2"
            >
                {t("exportOrders")}
            </button>
            {showAddModal && (
                <AddOrderModal
                    onClose={() => setShowAddModal(false)}
                    onSaved={() => {
                        // Refresh logic would go here, maybe re-fetch or use server action
                        // For now we rely on initialOrders, but in real app we'd revalidate
                        window.location.reload();
                    }}
                />
            )}
            {showExportModal && (
                <ExportModal
                    onClose={() => setShowExportModal(false)}
                    onExport={handleExport}
                />
            )}

            {/* Filters */}
            <div className="flex gap-4 mb-4 items-center flex-wrap">
                <input
                    type="text"
                    placeholder={t("searchOrdersPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border px-3 py-2 rounded w-64"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border px-3 py-2 rounded"
                >
                    <option value="all">{t("selectStatus")}</option>
                    {orderStatus.map((stat, ind) => (
                        <option key={ind} value={stat}>
                            {t(stat) || stat}
                        </option>
                    ))}
                </select>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="border px-3 py-2 rounded"
                >
                    <option value="newest">{t("newestFirst")}</option>
                    <option value="oldest">{t("oldestFirst")}</option>
                    <option value="total_desc">{t("totalHighLow")}</option>
                    <option value="total_asc">{t("totalLowHigh")}</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-md text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left border-b">{t("orderId")}</th>
                            <th className="px-4 py-2 text-left border-b">{t("customerName")}</th>
                            <th className="px-4 py-2 text-left border-b">{t("customerPhone")}</th>
                            <th className="px-4 py-2 text-left border-b">{t("address")}</th>
                            <th className="px-4 py-2 text-left border-b">{t("governorate")}</th>
                            <th className="px-4 py-2 text-left border-b">{t("status")}</th>
                            <th className="px-4 py-2 text-left border-b">{t("total")}</th>
                            <th className="px-4 py-2 text-left border-b">{t("createdAt")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(filteredOrders?.length ?? 0) > 0 ? (
                            filteredOrders.map((order) => (
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
                                        {t(order.order_status) || order.order_status}
                                    </span></td>
                                    <td className="px-4 py-2 border-b">{order.final_order_total} {t("EGP")}</td>
                                    <td className="px-4 py-2 border-b">
                                        {t('{{date, datetime}}', { date: new Date(order.order_date) })}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={10}
                                    className="px-4 py-6 text-center text-gray-500"
                                >
                                    {t("noOrdersFound")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
