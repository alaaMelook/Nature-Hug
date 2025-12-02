"use client";

import React, { useState } from "react";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { Order, OrderStatus } from "@/domain/entities/database/order";
import { orderStatus } from "@/lib/utils/status";
import { toTitleCase } from "@/lib/utils/titleCase";
import { OrderDetailsModal } from "@/ui/components/admin/orderDetail";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded max-w-md w-full shadow-lg p-6"
            >
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
                        className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
                        disabled={saving}
                    >
                        {t("cancel")}
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        disabled={saving}
                    >
                        {t("save")}
                    </button>
                </div>
            </motion.div>
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
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded max-w-sm w-full shadow-lg p-6"
            >
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
                        className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        onClick={() => onExport(status)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        {t("export")}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export function OrdersScreen({ initialOrders }: { initialOrders: OrderDetailsView[] }) {
    const { t } = useTranslation();
    const router = useRouter();
    const params = useParams();
    const lang = params.lang as string;
    const [orders, setOrders] = useState<OrderDetailsView[]>(initialOrders);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sort, setSort] = useState("newest");
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [processingBulk, setProcessingBulk] = useState(false);

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

    const toggleSelectAll = () => {
        if (selectedOrders.length === filteredOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(filteredOrders.map(o => o.order_id));
        }
    };

    const toggleSelectOrder = (id: number) => {
        if (selectedOrders.includes(id)) {
            setSelectedOrders(selectedOrders.filter(oid => oid !== id));
        } else {
            setSelectedOrders([...selectedOrders, id]);
        }
    };

    const handleBulkAction = async (action: 'accept' | 'reject') => {
        if (selectedOrders.length === 0) return;
        if (!confirm(t(`confirmBulk${action === 'accept' ? 'Accept' : 'Reject'}`))) return;

        setProcessingBulk(true);
        try {
            // Import actions dynamically or use the ones we have
            const { acceptOrderAction, rejectOrderAction } = await import("@/ui/hooks/admin/orders");

            const promises = selectedOrders.map(id =>
                action === 'accept' ? acceptOrderAction(id.toString()) : rejectOrderAction(id.toString())
            );

            await Promise.all(promises);
            toast.success(t("bulkActionSuccess"));
            setSelectedOrders([]);
            // Refresh logic - ideally re-fetch or rely on server action revalidation
            router.refresh();
        } catch (error) {
            console.error("Bulk action failed:", error);
            toast.error(t("bulkActionFailed"));
        } finally {
            setProcessingBulk(false);
        }
    };

    const handleExport = async (status: string) => {
        // ... (existing export logic)
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6"
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{t("allOrders")}</h1>
                <div className="flex gap-2">
                    {selectedOrders.length > 0 && (
                        <>
                            <button
                                onClick={() => handleBulkAction('accept')}
                                disabled={processingBulk}
                                className="bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 disabled:opacity-50 font-medium transition-colors"
                            >
                                {t("acceptSelected")} ({selectedOrders.length})
                            </button>
                            <button
                                onClick={() => handleBulkAction('reject')}
                                disabled={processingBulk}
                                className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 disabled:opacity-50 font-medium transition-colors"
                            >
                                {t("rejectSelected")} ({selectedOrders.length})
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                        + {t("addOrder")}
                    </button>
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        {t("exportOrders")}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showAddModal && (
                    <AddOrderModal
                        onClose={() => setShowAddModal(false)}
                        onSaved={() => {
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
            </AnimatePresence>

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
            <div className="overflow-x-auto bg-white rounded-lg shadow border">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left w-10">
                                <input
                                    type="checkbox"
                                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded border-gray-300"
                                />
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{t("orderId")}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{t("customerName")}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{t("customerPhone")}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{t("address")}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{t("governorate")}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{t("status")}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{t("total")}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{t("createdAt")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <AnimatePresence>
                            {(filteredOrders?.length ?? 0) > 0 ? (
                                filteredOrders.map((order) => (
                                    <motion.tr
                                        key={order.order_id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        layout
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={(e) => {
                                            // Prevent navigation if clicking checkbox
                                            if ((e.target as HTMLElement).tagName === 'INPUT') return;
                                            router.push(`/${lang}/admin/orders/${order.order_id}`);
                                        }}
                                    >
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order.order_id)}
                                                onChange={() => toggleSelectOrder(order.order_id)}
                                                className="rounded border-gray-300"
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{order.order_id}</td>
                                        <td className="px-4 py-3 text-gray-700">{order.customer_name}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {order.phone_numbers.map((phone, i) => (
                                                <div key={i}>{phone}</div>
                                            ))}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={order.shipping_street_address}>{order.shipping_street_address}</td>
                                        <td className="px-4 py-3 text-gray-600">{order.shipping_governorate}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.order_status === "completed" ? "bg-green-100 text-green-800" : order.order_status === "pending" ? "bg-yellow-100 text-yellow-800" : order.order_status === "processing" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}>
                                                {t(order.order_status) || order.order_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{order.final_order_total} {t("EGP")}</td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {t("{{date, datetime}}", { date: new Date(order.order_date) })}
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-4 py-12 text-center text-gray-500"
                                    >
                                        {t("noOrdersFound")}
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
