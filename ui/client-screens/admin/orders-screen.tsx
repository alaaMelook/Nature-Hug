"use client";

import { useEffect, useState } from "react";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { orderStatus } from "@/lib/utils/status";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { generateInvoicePDF } from "@/lib/utils/invoiceGenerator";
import { Loader2 } from "lucide-react";
import { statusColor } from "@/lib/utils/statusColors";
import { PromoCode } from "@/domain/entities/database/promoCode";
import { FilterIcon, FileSpreadsheet } from "lucide-react";
import { exportOrdersToExcel } from "@/lib/utils/excelExporter";

export function OrdersScreen({ initialOrders, promoCodes = [] }: { initialOrders: OrderDetailsView[], promoCodes?: PromoCode[] }) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [promoCodeFilter, setPromoCodeFilter] = useState("all");
    const [sort, setSort] = useState("newest");
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [processingBulk, setProcessingBulk] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState(initialOrders);
    const [isSyncing, setIsSyncing] = useState(true);
    const [processedCount, setProcessedCount] = useState(0);

    useEffect(() => {
        setOrders(initialOrders);
        let mounted = true;

        async function syncOrders() {
            // Filter orders that might need syncing (have AWB and not cancelled/returned)
            // Optimization: only sync active orders or orders that are not final-final?
            // User Req: "fetch the shipment details for each order having awb as not null"
            // But syncing 1000 orders might be slow. Let's sync displayed orders?
            // Since this is client component with filtered/paginated list passed as props or full list?
            // initialOrders seems to be full list passed from server component.

            const ordersToSync = initialOrders.filter(o =>
                o.awb &&
                o.order_status !== 'cancelled' &&
                o.order_status !== 'returned' &&
                // If delivered and paid, probably done, but user said: 
                // "if it was "delivered" update order status to "Delivered" and the payment status to "paid""
                // So if it is already delivered AND paid, skip?
                !(o.order_status === 'delivered' && o.payment_status === 'paid')
            );

            if (ordersToSync.length === 0) {
                if (mounted) setIsSyncing(false);
                return;
            }

            // Sync in batches to avoid overwhelming browser/server
            const BATCH_SIZE = 5;
            let changesDetected = false;

            for (let i = 0; i < ordersToSync.length; i += BATCH_SIZE) {
                if (!mounted) break;
                const batch = ordersToSync.slice(i, i + BATCH_SIZE);

                await Promise.all(batch.map(async (order) => {
                    import("@/ui/hooks/admin/orders").then(async (mod) => {
                        const res = await mod.syncOrderStatusAction(order);
                        if (res.updated) changesDetected = true;
                    });
                }));

                if (mounted) setProcessedCount(prev => Math.min(prev + batch.length, ordersToSync.length));
            }

            if (mounted) {
                setIsSyncing(false);
                if (changesDetected) {
                    router.refresh(); // Refresh server data
                }
            }
        }

        syncOrders();

        return () => { mounted = false; };
    }, [initialOrders, router]);

    // Loading overlay
    if (isSyncing) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                    <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto mb-4" />
                    <p className="text-sm text-gray-500">{processedCount}</p>
                </div>
            </div>
        );
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (order.customer_name?.toLowerCase().includes(search.toLowerCase()) || false) ||
            (order.phone_numbers?.some(phone => phone.includes(search)) || false);
        const matchesStatus = statusFilter === "all" || order.order_status === statusFilter.toLowerCase();
        const matchesPromo = promoCodeFilter === "all" || order.applied_promo_code === promoCodeFilter;
        return matchesSearch && matchesStatus && matchesPromo;
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
    const toggleFilter = () => {
        setFilterOpen(!filterOpen);
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


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6"
        >
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div className="flex justify-between items-center w-full md:w-auto">
                    <h1 className="text-2xl font-bold">{t("allOrders")}</h1>
                </div>

                <div className="md:hidden flex gap-2 w-full">
                    <input
                        type="text"
                        placeholder={t("searchOrdersPlaceholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border px-3 py-2 flex-grow rounded-lg"
                    />
                    <button
                        onClick={toggleFilter}
                        className="bg-gray-100 text-gray-700 p-2 rounded-lg flex-shrink-0 hover:bg-gray-200 font-medium transition-colors border border-gray-200"
                    >
                        {t("filter")}
                        <FilterIcon className="w-5 h-5 mx-2" />
                    </button>
                </div>

                <div className="hidden md:flex gap-2">
                    {selectedOrders.length > 0 && (
                        <>
                            <button
                                onClick={async () => {
                                    setProcessingBulk(true);
                                    try {
                                        const selected = orders.filter(o => selectedOrders.includes(o.order_id));
                                        await generateInvoicePDF(selected);
                                    } catch (e) {
                                        console.error(e);
                                        toast.error(t("errorGeneratingInvoice") || "Error generating invoice");
                                    } finally {
                                        setProcessingBulk(false);
                                    }
                                }}
                                disabled={processingBulk}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 disabled:opacity-50 font-medium transition-colors border border-gray-200"
                            >
                                {t("exportInvoices")} ({selectedOrders.length})
                            </button>
                            <button
                                onClick={() => {
                                    const selected = orders.filter(o => selectedOrders.includes(o.order_id));
                                    exportOrdersToExcel(selected);
                                    toast.success(t("excelExportStarted"));
                                }}
                                disabled={processingBulk}
                                className="bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 disabled:opacity-50 font-medium transition-colors border border-green-200 flex items-center gap-2"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                {t("exportExcel") || "Export Excel"} ({selectedOrders.length})
                            </button>
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

                </div>
            </div>
            {filterOpen && (
                <div className={`md:hidden sticky mb-5 bg-white z-2 `}>
                    <div className="p-4 grid grid-cols-2 gap-2">

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border px-3 py-2 rounded w-full"

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
                            className="border px-3 py-2 rounded w-full"
                        >
                            <option value="newest">{t("newestFirst")}</option>
                            <option value="oldest">{t("oldestFirst")}</option>
                            <option value="total_desc">{t("totalHighLow")}</option>
                            <option value="total_asc">{t("totalLowHigh")}</option>
                        </select>
                        <select
                            value={promoCodeFilter}
                            onChange={(e) => setPromoCodeFilter(e.target.value)}
                            className="border px-3 py-2 rounded w-full"

                        >
                            <option value="all">{t("selectPromoCode")}</option>
                            {promoCodes.length > 0 ? promoCodes.map((promo, index) => (
                                <option key={index} value={promo.code}>
                                    {promo.code}
                                </option>
                            )) : <option value="">{t("noPromoCodes")}</option>}
                        </select>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="hidden md:flex gap-4 mb-4 md:items-center md:flex-wrap">
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
                <select
                    value={promoCodeFilter}
                    onChange={(e) => setPromoCodeFilter(e.target.value)}
                    className="border px-3 py-2 rounded"
                >
                    <option value="all">{t("selectPromoCode")}</option>
                    {promoCodes.length > 0 ? promoCodes.map((promo, index) => (
                        <option key={index} value={promo.code}>
                            {promo.code}
                        </option>
                    )) : <option value="">{t("noPromoCodes")}</option>}
                </select>
            </div>

            {/* Table */}

            <div className="overflow-x-auto bg-white rounded-lg shadow border hidden md:block">
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
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase ">{t("orderId")}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase ">{t("customerName")}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase ">{t("governorate")}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase ">{t("promoCode")}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase ">{t("status")}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase ">{t("payment")}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase ">{t("total")}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase ">{t("createdBy")}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase ">{t("createdAt")}</th>
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
                                            router.push(`/admin/orders/${order.order_id}`);
                                        }}
                                    >
                                        <>
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
                                            <td className="px-4 py-3 text-gray-600">{order.shipping_governorate}</td>
                                            <td className="px-4 py-3 text-gray-600 text-center">
                                                {order.applied_promo_code ? (
                                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-100">
                                                        {order.applied_promo_code}
                                                    </span>
                                                ) : <span className="text-gray-600 w-full tracking-wider">&mdash;</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${statusColor(order.order_status)}`}>
                                                    {order.order_status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">{order.payment_method}</span>

                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900">{t('{{price, currency}}', { price: order.final_order_total })}</td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {order.created_by_user_name ? (
                                                    <div className="flex items-center gap-1">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${order.created_by_user_role === 'admin'
                                                                ? 'bg-purple-50 text-purple-700'
                                                                : 'bg-blue-50 text-blue-700'
                                                            }`}>
                                                            {order.created_by_user_role === 'admin' && '👤'}
                                                            {order.created_by_user_role === 'moderator' && '👔'}
                                                            {' '}{order.created_by_user_name}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">{t("customer")}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {t("{{date, datetime}}", { date: new Date(order.order_date) }).split(",").map((item, index) => (
                                                    <p key={index}>{item}</p>
                                                ))}
                                            </td>
                                        </>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={10}
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
            <div className="md:hidden">
                {/* mobile view order view should be card-like */}
                <div className="grid grid-cols-1 gap-4 pb-32 md:pb-0">
                    <AnimatePresence>
                        {(filteredOrders?.length ?? 0) > 0 ? (
                            filteredOrders.map((order) => (
                                <motion.div
                                    key={order.order_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    layout
                                    className="bg-white rounded-lg shadow p-4 border border-gray-200 relative"
                                >
                                    <div className={`absolute ${i18n.dir() === "ltr" ? "left-4" : "right-4"} top-4`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.includes(order.order_id)}
                                            onChange={() => toggleSelectOrder(order.order_id)}
                                            className="rounded border-gray-300"
                                        />
                                    </div>
                                    <div
                                        onClick={(e) => {
                                            if ((e.target as HTMLElement).tagName === 'INPUT') return;
                                            router.push(`/admin/orders/${order.order_id}`);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between mb-3 mx-5">
                                            <h3 className="font-semibold text-lg text-gray-900">#{order.order_id}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(order.order_status)}`}>
                                                {order.order_status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 mb-3">
                                            <div>
                                                <span className="font-medium">{t("customerName")}:</span> {order.customer_name}
                                            </div>
                                            <div>
                                                <span className="font-medium">{t("governorate")}:</span> {order.shipping_governorate}
                                            </div>
                                            <div>
                                                <span className="font-medium">{t("payment")}:</span> {order.payment_method}
                                            </div>
                                            {order.applied_promo_code && (
                                                <div>
                                                    <span className="font-medium">{t("promoCode")}:</span>{' '}
                                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-100">
                                                        {order.applied_promo_code}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {order.created_by_user_name && (
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 mb-3">
                                                <div>
                                                    <span className="font-medium">{t("createdBy")}:</span>{" "}
                                                    <span className={`text-xs px-2 py-1 rounded-full ${order.created_by_user_role === 'admin'
                                                            ? 'bg-purple-50 text-purple-700'
                                                            : 'bg-blue-50 text-blue-700'
                                                        }`}>
                                                        {order.created_by_user_name}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-end justify-between pt-3 border-t border-gray-100 mt-3">
                                            <p className="text-gray-500 text-xs">
                                                {t("{{date, datetime}}", { date: new Date(order.order_date) }).split(",").map((item, index) => (
                                                    <span key={index} className="block">{item.trim()}</span>
                                                ))}
                                            </p>
                                            <p className="text-xl font-bold text-gray-900">
                                                {t('{{price, currency}}', { price: order.final_order_total })}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                {t("noOrdersFound")}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <AnimatePresence>
                {selectedOrders.length > 0 && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="md:hidden fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-xl p-4 shadow-2xl z-50 flex flex-col gap-3"
                        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
                    >
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-semibold text-gray-800">{selectedOrders.length} {t("ordersSelected") || "orders selected"}</span>
                            <button onClick={() => setSelectedOrders([])} className="text-gray-500 text-sm font-medium px-2 py-1 bg-gray-100 rounded">{t("clear") || "Clear"}</button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handleBulkAction('accept')}
                                disabled={processingBulk}
                                className="bg-green-100 text-green-700 px-2 py-3 rounded-lg hover:bg-green-200 disabled:opacity-50 font-medium text-sm transition-colors text-center"
                            >
                                {t("acceptSelected")}
                            </button>
                            <button
                                onClick={() => handleBulkAction('reject')}
                                disabled={processingBulk}
                                className="bg-red-100 text-red-700 px-2 py-3 rounded-lg hover:bg-red-200 disabled:opacity-50 font-medium text-sm transition-colors text-center"
                            >
                                {t("rejectSelected")}
                            </button>
                            <button
                                onClick={async () => {
                                    setProcessingBulk(true);
                                    try {
                                        const selected = orders.filter(o => selectedOrders.includes(o.order_id));
                                        await generateInvoicePDF(selected);
                                    } catch (e) {
                                        console.error(e);
                                        toast.error(t("errorGeneratingInvoice") || "Error generating invoice");
                                    } finally {
                                        setProcessingBulk(false);
                                    }
                                }}
                                disabled={processingBulk}
                                className="bg-gray-100 text-gray-700 px-2 py-3 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium text-sm transition-colors border border-gray-200 text-center"
                            >
                                {t("exportInvoices")}
                            </button>
                            <button
                                onClick={() => {
                                    const selected = orders.filter(o => selectedOrders.includes(o.order_id));
                                    exportOrdersToExcel(selected);
                                    toast.success(t("excelExportStarted"));
                                }}
                                disabled={processingBulk}
                                className="bg-green-100 text-green-700 px-2 py-3 rounded-lg hover:bg-green-200 disabled:opacity-50 font-medium text-sm transition-colors border border-green-200 flex items-center justify-center gap-1 text-center"
                            >
                                <FileSpreadsheet className="w-3 h-3" />
                                {t("exportExcel") || "Export Excel"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div >
    );
}
