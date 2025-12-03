"use client";

import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { City } from "@/domain/entities/shipment/city";
import {
    acceptOrderAction,
    rejectOrderAction,
    cancelOrderAction,
    markAsOutForDeliveryAction,
    updateOrderAction
} from "@/ui/hooks/admin/orders";
import { getCitiesAction } from "@/ui/hooks/admin/shippingActions";
import { User, MapPin, Phone, Package, Calendar, ArrowLeft, X } from "lucide-react";
import { ShipmentTracking } from "@/ui/components/admin/ShipmentTracking";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export function OrderDetailsScreen({ order }: { order: OrderDetailsView }) {
    const { t } = useTranslation();
    const router = useRouter();
    const [updating, setUpdating] = useState(false);
    const [cities, setCities] = useState<City[]>([]);

    useEffect(() => {
        getCitiesAction().then(result => {
            if (result.success && result.cities) {
                setCities(result.cities);
            } else {
                console.error("Failed to fetch cities:", result.error);
            }
        });
    }, []);

    const handleStatusChange = async (newStatus: string) => {
        setUpdating(true);
        try {
            let result;
            if (newStatus === 'processing' && order.order_status === 'pending') {
                result = await acceptOrderAction(order.order_id.toString());
            } else if (newStatus === 'declined' && order.order_status === 'pending') {
                result = await rejectOrderAction(order.order_id.toString());
            } else if (newStatus === 'cancelled') {
                result = await cancelOrderAction(order.order_id.toString());
            } else if (newStatus === 'out for delivery') {
                const city = cities.find(c => c.cityName.toLowerCase().includes(order.shipping_governorate.toLowerCase()) || order.shipping_governorate.toLowerCase().includes(c.cityName.toLowerCase()));
                const cityId = city ? city.cityId : 1;
                const shipmentData = {
                    clientName: order.customer_name,
                    cityId: cityId,
                    address: order.shipping_street_address,
                    phone: order.phone_numbers[0] || "",
                    codAmount: order.final_order_total,
                    weight: 1,
                };
                result = await markAsOutForDeliveryAction(order, shipmentData);
            } else {
                result = await updateOrderAction({ ...order, order_status: newStatus });
            }

            if (result.success) {
                toast.success(t("orderStatusUpdated", { status: newStatus }));
                router.refresh();
            } else {
                toast.error(result.error || t("failedToUpdateOrder"));
            }
        } catch (error) {
            console.error("Failed to update order:", error);
            toast.error(t("failedToUpdateOrder"));
        } finally {
            setUpdating(false);
        }
    };

    const actions = orderActions({ status: order.order_status });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="p-6 max-w-7xl mx-auto"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {t("orderId")} #{order.order_id}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wide ${getStatusColor(order.order_status)}`}>
                                {t(order.order_status) || order.order_status}
                            </span>
                        </h1>
                    </div>
                </div>

                <div className="flex gap-3">
                    {actions.neg && (
                        <button
                            onClick={() => handleStatusChange(actions.status_neg)}
                            disabled={updating}
                            className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {t(actions.neg)}
                        </button>
                    )}
                    {actions.pos && (
                        <button
                            onClick={() => handleStatusChange(actions.status_pos)}
                            disabled={updating}
                            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm"
                        >
                            {t(actions.pos)}
                        </button>
                    )}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Customer & Shipping */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <User size={14} /> {t("customerDetails")}
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                {order.customer_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 text-lg">{order.customer_name}</p>
                                <div className="flex items-center gap-2 text-gray-500 mt-1">
                                    <Phone size={14} />
                                    {order.phone_numbers[0] || "No phone"}
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <MapPin size={14} /> {t("shippingAddress")}
                        </h3>
                        <div className="text-gray-700 space-y-2">
                            <p className="font-medium text-lg">{order.shipping_street_address}</p>
                            <p className="text-gray-500">{order.shipping_governorate}</p>
                        </div>
                    </motion.section>

                    {order.awb && (
                        <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border p-6">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Package size={14} /> {t("shipmentTracking")}
                            </h3>
                            <div className="space-y-3">
                                <p className="text-sm"><span className="font-medium text-gray-700">{t("awb")}:</span> {order.awb}</p>
                                <ShipmentTracking awb={order.awb} />
                            </div>
                        </motion.section>
                    )}

                    <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Calendar size={14} /> {t("orderInfo")}
                        </h3>
                        <div className="text-sm text-gray-600">
                            {t("placedOn")} {new Date(order.order_date).toLocaleDateString()} {t("at")} {new Date(order.order_date).toLocaleTimeString()}
                        </div>
                    </motion.section>
                </div>

                {/* Right Column: Order Items & Summary */}
                <div className="lg:col-span-2 flex flex-col h-full">
                    <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border flex-1 flex flex-col overflow-hidden">
                        <div className="p-6 border-b">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Package size={14} /> {t("orderItems")}
                            </h3>
                        </div>
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">{t("item")}</th>
                                        <th className="px-6 py-3 font-medium text-right">{t("qty")}</th>
                                        <th className="px-6 py-3 font-medium text-right">{t("price")}</th>
                                        <th className="px-6 py-3 font-medium text-right">{t("total")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {order.items.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                <div className="flex items-center gap-3">

                                                    {item.item_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-600">{item.quantity}</td>
                                            <td className="px-6 py-4 text-right text-gray-600">{t('{{price, currency}}', { price: item.unit_price })}</td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-900">{t('{{price, currency}}', { price: item.quantity * item.unit_price })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-gray-50 p-6 border-t">
                            <div className="flex flex-col gap-2 items-end">
                                <div className="flex justify-between w-full max-w-xs text-sm text-gray-600">
                                    <span>{t("subtotal")}</span>
                                    <span>{t('{{price, currency}}', { price: order.subtotal })}</span>
                                </div>
                                <div className="flex justify-between w-full max-w-xs text-sm text-gray-600">
                                    <span>{t("shipping")}</span>
                                    <span>{t('{{price, currency}}', { price: order.shipping_total })}</span>
                                </div>
                                <div className="flex justify-between w-full max-w-xs text-sm text-gray-600">
                                    <span>{t("discount")}</span>
                                    <span>{t('{{price, currency}}', { price: order.discount })}</span>
                                </div>
                                <div className="flex justify-between w-full max-w-xs text-lg font-bold text-gray-900 mt-2 pt-2 border-t">
                                    <span>{t("totalAmount")}</span>
                                    <span>{t('{{price, currency}}', { price: order.final_order_total })}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'processing': return 'bg-blue-100 text-blue-800';
        case 'out for delivery': return 'bg-orange-100 text-orange-800';
        case 'shipped': return 'bg-purple-100 text-purple-800';
        case 'delivered': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        case 'declined': return 'bg-red-100 text-red-800';
        case 'returned': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function orderActions({ status }: { status: string }) {
    switch (status) {
        case 'pending':
            return { pos: 'acceptOrder', neg: 'rejectOrder', status_pos: 'processing', status_neg: 'declined' };
        case 'processing':
            return { pos: 'markAsOutForDelivery', neg: 'cancelOrder', status_pos: 'out for delivery', status_neg: 'cancelled' };
        case 'out for delivery':
            return { pos: 'markAsShipped', neg: 'cancelOrder', status_pos: 'shipped', status_neg: 'cancelled' };
        case 'shipped':
            return { pos: 'markAsDelivered', neg: 'returnOrder', status_pos: 'delivered', status_neg: 'returned' };
        default:
            return { pos: null, neg: null, status_pos: '', status_neg: '' };
    }
}
