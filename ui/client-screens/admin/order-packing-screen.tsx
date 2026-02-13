"use client";

import { useState } from "react";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Package, CheckCircle2, Loader2, ChevronDown, ChevronUp } from "lucide-react";

export default function OrderPackingScreen({ initialOrders }: { initialOrders: OrderDetailsView[] }) {
    const router = useRouter();
    const [orders, setOrders] = useState(initialOrders);
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [packing, setPacking] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

    // Only show processing orders that are not yet packed
    const unpackedOrders = orders.filter(o => o.order_status === 'processing' && !o.packed);

    const toggleSelect = (id: number) => {
        setSelectedOrders(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedOrders.length === unpackedOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(unpackedOrders.map(o => o.order_id));
        }
    };

    const handlePack = async (orderIds: number[]) => {
        if (orderIds.length === 0) return;
        if (!confirm(`Mark ${orderIds.length} order(s) as packed? Packaging materials will be deducted.`)) return;

        setPacking(true);
        try {
            const res = await fetch("/api/admin/orders/pack", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderIds }),
            });

            const data = await res.json();

            if (res.ok) {
                const successIds = data.results
                    .filter((r: any) => r.success)
                    .map((r: any) => r.orderId);

                // Remove packed orders from the list
                setOrders(prev => prev.map(o =>
                    successIds.includes(o.order_id) ? { ...o, packed: true } : o
                ));
                setSelectedOrders(prev => prev.filter(id => !successIds.includes(id)));

                toast.success(`✅ ${successIds.length} order(s) packed successfully!`);

                // Show failures if any
                const failures = data.results.filter((r: any) => !r.success);
                if (failures.length > 0) {
                    toast.error(`⚠️ ${failures.length} order(s) failed to pack`);
                }
            } else {
                toast.error(data.error || "Failed to pack orders");
            }
        } catch (err) {
            console.error("Pack error:", err);
            toast.error("Failed to pack orders");
        } finally {
            setPacking(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Package className="w-7 h-7 text-amber-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Packing</h1>
                        <p className="text-sm text-gray-500">{unpackedOrders.length} order(s) waiting to be packed</p>
                    </div>
                </div>

                {selectedOrders.length > 0 && (
                    <button
                        onClick={() => handlePack(selectedOrders)}
                        disabled={packing}
                        className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors shadow-sm"
                    >
                        {packing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4" />
                        )}
                        Pack Selected ({selectedOrders.length})
                    </button>
                )}
            </div>

            {/* Orders List */}
            {unpackedOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <CheckCircle2 className="w-16 h-16 mb-4" />
                    <p className="text-lg font-medium">All orders are packed!</p>
                    <p className="text-sm">No pending orders to pack right now.</p>
                </div>
            ) : (
                <>
                    {/* Select All */}
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <input
                            type="checkbox"
                            checked={selectedOrders.length === unpackedOrders.length && unpackedOrders.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded border-gray-300 w-4 h-4"
                        />
                        <span className="text-sm text-gray-600 font-medium">Select All</span>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence>
                            {unpackedOrders.map(order => (
                                <motion.div
                                    key={order.order_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100, height: 0 }}
                                    layout
                                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                                >
                                    {/* Order Row */}
                                    <div className="flex items-center gap-4 p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.includes(order.order_id)}
                                            onChange={() => toggleSelect(order.order_id)}
                                            className="rounded border-gray-300 w-4 h-4 flex-shrink-0"
                                        />

                                        <div
                                            className="flex-1 flex items-center justify-between cursor-pointer"
                                            onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}
                                        >
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <span className="font-bold text-gray-900 text-lg">#{order.order_id}</span>
                                                <span className="text-gray-700 font-medium">{order.customer_name}</span>
                                                <span className="text-gray-500 text-sm">{order.shipping_governorate}</span>
                                                <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                                    {order.items?.length || 0} item(s)
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    EGP {order.final_order_total?.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {expandedOrder === order.order_id ? (
                                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePack([order.order_id]);
                                            }}
                                            disabled={packing}
                                            className="flex-shrink-0 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg hover:bg-green-100 disabled:opacity-50 font-medium text-sm transition-colors flex items-center gap-1.5"
                                        >
                                            {packing ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            )}
                                            Pack
                                        </button>
                                    </div>

                                    {/* Expanded: Items Detail */}
                                    <AnimatePresence>
                                        {expandedOrder === order.order_id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Order Items</h4>
                                                    <div className="space-y-2">
                                                        {order.items?.map((item, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <span className="bg-amber-100 text-amber-700 text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">
                                                                        {item.quantity}x
                                                                    </span>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-900">{item.item_name}</p>
                                                                        {item.variant_name && (
                                                                            <p className="text-xs text-gray-500">{item.variant_name}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    EGP {item.line_item_total?.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        )) || <p className="text-sm text-gray-400">No items</p>}
                                                    </div>

                                                    {/* Order note if exists */}
                                                    {order.note && (
                                                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                            <p className="text-xs font-semibold text-yellow-700 mb-1">📝 Note:</p>
                                                            <p className="text-sm text-yellow-800">{order.note}</p>
                                                        </div>
                                                    )}

                                                    {/* Phone numbers */}
                                                    {order.phone_numbers && order.phone_numbers.length > 0 && (
                                                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                                            <span>📞</span>
                                                            {order.phone_numbers.map((phone, idx) => (
                                                                <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                                                                    {phone}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </motion.div>
    );
}
