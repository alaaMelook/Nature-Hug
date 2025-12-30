"use client";

import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
    acceptOrderAction,
    rejectOrderAction,
    cancelOrderAction,
    markAsOutForDeliveryAction,
    updateOrderAction,
    cancelShippedOrderAction,
    deleteOrderAction
} from "@/ui/hooks/admin/orders";
import { User, MapPin, Phone, Package, Calendar, ArrowLeft, X, CreditCard, Mail, Loader2, Trash2, Edit2, Save } from "lucide-react";
import { ShipmentTracking } from "@/ui/components/admin/ShipmentTracking";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { statusColor } from "@/lib/utils/statusColors";
import { Shipment } from "@/domain/entities/shipment/shipment";
import { Governorate } from "@/domain/entities/database/governorate";

export function OrderDetailsScreen({ order, governorate }: { order: OrderDetailsView, governorate: Governorate }) {
    const { t } = useTranslation();
    const router = useRouter();
    const [updating, setUpdating] = useState(false);
    const [isSyncing, setIsSyncing] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        customer_name: order.customer_name,
        customer_email: order.customer_email || '',
        phone_numbers: [...order.phone_numbers],
        shipping_street_address: order.shipping_street_address,
        subtotal: order.subtotal,
        shipping_total: order.shipping_total,
        discount_total: order.discount_total,
        final_order_total: order.final_order_total,
    });

    useEffect(() => {
        if (order.awb && order.order_status !== 'cancelled' && order.order_status !== 'returned' && !(order.order_status === 'delivered' && order.payment_status === 'paid')) {
            import("@/ui/hooks/admin/orders").then(async (mod) => {
                const res = await mod.syncOrderStatusAction(order);
                setIsSyncing(false);
                if (res.updated) {
                    router.refresh();
                }
            });
        } else {
            setIsSyncing(false);
        }
    }, [order, router]);




    if (isSyncing) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                    <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto mb-4" />
                </div>
            </div>
        );
    }

    const handleStatusChange = async (newStatus: string, isManual: boolean = false) => {
        setUpdating(true);
        try {
            let result;
            if (newStatus === 'processing') {
                result = await acceptOrderAction(order.order_id.toString());
            } else if (newStatus === 'declined') {
                result = await rejectOrderAction(order.order_id.toString());
            } else if (newStatus === 'cancelled' && order.order_status === 'processing') {
                result = await cancelOrderAction(order.order_id.toString());
            } else if (newStatus === 'cancelled' && order.order_status === 'out for delivery') {

                result = await cancelShippedOrderAction(order);
            }

            else if (newStatus === 'out for delivery' && !isManual) {
                // Debug logging for COD issue
                console.log("[Shipment Debug] Order Data:", {
                    payment_method: order.payment_method,
                    final_order_total: order.final_order_total,
                    subtotal: order.subtotal,
                    shipping_total: order.shipping_total,
                    discount_total: order.discount_total
                });

                const isCOD = order.payment_method.toLowerCase() !== 'online card';
                const codValue = isCOD ? order.final_order_total : 0;

                console.log("[Shipment Debug] COD Calculation:", {
                    isCOD,
                    codValue,
                    payment_method_lowercase: order.payment_method.toLowerCase()
                });

                // Create shipment with correct API field names
                const shipmentData: Shipment = {
                    toAddress: order.shipping_street_address,
                    toPhone: order.phone_numbers[0] || "",
                    toMobile: order.phone_numbers[0] || "",
                    cod: codValue,  // Changed from codAmount to cod
                    fromAddress: "",
                    toConsigneeName: order.customer_name,
                    toCityID: governorate.cityID,  // Changed from toCityId to toCityID
                    specialInstuctions: "في حالة وجود مشكلة 01090998664",  // Changed from shipperNotes
                    pieces: order.items.reduce((acc, item) => acc + item.quantity, 0),
                    fromCityID: 1078
                };

                console.log("[Shipment Debug] Full Shipment Request:", JSON.stringify(shipmentData, null, 2));

                result = await markAsOutForDeliveryAction(order, shipmentData);
            } else {
                result = await updateOrderAction({ ...order, order_status: newStatus });
            }

            if (result.success) {
                toast.success(t("orderStatusUpdated", { status: newStatus }));
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

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const result = await deleteOrderAction(order.order_id);
            if (result.success) {
                toast.success(t("orderDeleted"));
                router.push(`/admin/orders`);
            } else {
                toast.error(result.error || t("failedToDeleteOrder"));
            }
        } catch (error) {
            console.error("Failed to delete order:", error);
            toast.error(t("failedToDeleteOrder"));
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            const result = await updateOrderAction({
                order_id: order.order_id,
                customer_name: editForm.customer_name,
                customer_email: editForm.customer_email,
                phone_numbers: editForm.phone_numbers,
                shipping_street_address: editForm.shipping_street_address,
                subtotal: editForm.subtotal,
                shipping_total: editForm.shipping_total,
                discount_total: editForm.discount_total,
                final_order_total: editForm.final_order_total,
            });
            if (result.success) {
                toast.success(t("orderUpdated"));
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(result.error || t("failedToUpdateOrder"));
            }
        } catch (error) {
            console.error("Failed to update order:", error);
            toast.error(t("failedToUpdateOrder"));
        } finally {
            setSaving(false);
        }
    };

    const handlePhoneChange = (index: number, value: string) => {
        const newPhones = [...editForm.phone_numbers];
        newPhones[index] = value;
        setEditForm({ ...editForm, phone_numbers: newPhones });
    };

    const addPhone = () => {
        setEditForm({ ...editForm, phone_numbers: [...editForm.phone_numbers, ''] });
    };

    const removePhone = (index: number) => {
        const newPhones = editForm.phone_numbers.filter((_, i) => i !== index);
        setEditForm({ ...editForm, phone_numbers: newPhones });
    };

    const cancelEdit = () => {
        setEditForm({
            customer_name: order.customer_name,
            customer_email: order.customer_email || '',
            phone_numbers: [...order.phone_numbers],
            shipping_street_address: order.shipping_street_address,
            subtotal: order.subtotal,
            shipping_total: order.shipping_total,
            discount_total: order.discount_total,
            final_order_total: order.final_order_total,
        });
        setIsEditing(false);
    };

    const actions = orderActions({ status: order.order_status, awb: order.awb });

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
            className="p-4 sm:p-6 max-w-7xl mx-auto" // Added p-4 for smaller screens
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label={t("goBack")}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
                                {t("orderId")} #{order.order_id}
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium uppercase tracking-wide ${statusColor(order.order_status)}`}>
                                    {t(order.order_status) || order.order_status}
                                </span>
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Actions - Changed to flex-wrap on mobile and justified end */}
                <div className="flex flex-wrap justify-start gap-3 mt-4 sm:mt-0 sm:justify-end">
                    <button
                        onClick={() => import("@/lib/utils/invoiceGenerator").then(mod => mod.generateInvoicePDF(order))}
                        className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                    >
                        {t("exportInvoice")}
                    </button>
                    {actions.neg && (
                        <button
                            onClick={() => handleStatusChange(actions.status_neg)}
                            disabled={updating}
                            className="flex-1 sm:flex-none px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {t(actions.neg)}
                        </button>
                    )}
                    {/* Separate Manual and Shipment actions for Processing state */}
                    {order.order_status === 'processing' && (
                        <>
                            <button
                                onClick={() => handleStatusChange('out for delivery', true)}
                                disabled={updating}
                                className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-gray-200"
                            >
                                {t("markAsOutForDelivery")} ({t("manual") || "Manual"})
                            </button>
                        </>
                    )}
                    {actions.pos && (
                        <button
                            onClick={() => handleStatusChange(actions.status_pos, false)}
                            disabled={updating}
                            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                        >
                            {order.order_status === 'processing' ? t("sendToShipment") : t(actions.pos)}
                        </button>
                    )}
                    {/* Delete Order Button */}
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={updating || deleting || isEditing}
                        className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                        aria-label={t("deleteOrder")}
                    >
                        <Trash2 size={16} />
                        {t("deleteOrder")}
                    </button>
                    {/* Edit Order Button */}
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            disabled={updating || deleting}
                            className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                        >
                            <Edit2 size={16} />
                            {t("editOrder")}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={cancelEdit}
                                disabled={saving}
                                className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-gray-200"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                disabled={saving}
                                className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                {saving ? t("saving") : t("saveChanges")}
                            </button>
                        </>
                    )}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8"> {/* Adjusted gap for mobile */}
                {/* Left Column: Customer & Shipping - Takes full width on mobile (default grid-cols-1) */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border p-4 sm:p-6"> {/* Adjusted padding */}
                        <h3 className="text-xs font-semibold text-gray-500 uppercase  mb-4 flex items-center gap-2">
                            <User size={14} /> {t("customerDetails")}
                        </h3>

                        <div className="space-y-3">
                            {isEditing ? (
                                <>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">{t("customerName")}</label>
                                        <input
                                            type="text"
                                            value={editForm.customer_name}
                                            onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">{t("email")}</label>
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-gray-400" />
                                            <input
                                                type="email"
                                                value={editForm.customer_email}
                                                onChange={(e) => setEditForm({ ...editForm, customer_email: e.target.value })}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">{t("phoneNumbers")}</label>
                                        {editForm.phone_numbers.map((phone, index) => (
                                            <div key={index} className="flex items-center gap-2 mt-2">
                                                <Phone size={14} className="text-gray-400" />
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                {editForm.phone_numbers.length > 1 && (
                                                    <button
                                                        onClick={() => removePhone(index)}
                                                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            onClick={addPhone}
                                            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            + {t("addPhone")}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="font-medium text-gray-900 text-base sm:text-lg">{order.customer_name}</p>
                                    {order.customer_email && (
                                        <div className="flex items-center gap-2 text-gray-500 mt-1 text-sm">
                                            <Mail size={14} />
                                            {order.customer_email}
                                        </div>
                                    )}
                                    {order.phone_numbers.map((phone, index) => (
                                        <div key={index} className="flex items-center gap-2 text-gray-500 mt-1 text-sm">
                                            <Phone size={14} />
                                            {phone}
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                    </motion.section>

                    <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border p-4 sm:p-6"> {/* Adjusted padding */}
                        <h3 className="text-xs font-semibold text-gray-500 uppercase  mb-4 flex items-center gap-2">
                            <MapPin size={14} /> {t("shippingAddress")}
                        </h3>
                        <div className="text-gray-700 space-y-2 text-sm">
                            {isEditing ? (
                                <textarea
                                    value={editForm.shipping_street_address}
                                    onChange={(e) => setEditForm({ ...editForm, shipping_street_address: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            ) : (
                                <p className="font-medium text-base sm:text-lg">{order.shipping_street_address}</p>
                            )}
                            <p className="text-gray-500">{order.shipping_governorate}</p>
                        </div>
                    </motion.section>

                    {order.awb && (
                        <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border p-4 sm:p-6"> {/* Adjusted padding */}
                            <h3 className="text-xs font-semibold text-gray-500 uppercase  mb-4 flex items-center gap-2">
                                <Package size={14} /> {t("shipmentTracking")}
                            </h3>
                            <div className="space-y-3">
                                <p className="text-sm"><span className="font-medium text-gray-700">{t("awb")}:</span> {order.awb}</p>
                                <ShipmentTracking awb={order.awb} />
                            </div>
                        </motion.section>
                    )}

                    <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border p-4 sm:p-6"> {/* Adjusted padding */}
                        <h3 className="text-xs font-semibold text-gray-500 uppercase  mb-4 flex items-center gap-2">
                            <Calendar size={14} /> {t("orderInfo")}
                        </h3>
                        <div className="text-sm text-gray-600">

                            {t("placedOn")}  {t("{{date, date}}", { date: new Date(order.order_date) })} <br /> {t("at")} {t("{{time, time}}", { time: new Date(order.order_date) })}
                        </div>
                    </motion.section>

                    <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border p-4 sm:p-6"> {/* Adjusted padding */}
                        <h3 className="text-xs font-semibold text-gray-500 uppercase  mb-4 flex items-center gap-2">
                            <CreditCard size={14} /> {t("paymentInfo")}
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">{t("paymentMethod")}</p>
                                <p className="font-medium text-gray-900 text-sm">{order.payment_method}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">{t("paymentStatus")}</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : order.payment_status === 'refunded' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {t(order.payment_status) || order.payment_status}
                                </span>
                            </div>
                        </div>
                    </motion.section>
                </div>

                {/* Right Column: Order Items & Summary - Takes full width on mobile */}
                <div className="lg:col-span-2 flex flex-col h-full">
                    <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border flex-1 flex flex-col overflow-hidden">
                        <div className="p-4 sm:p-6 border-b">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase  flex items-center gap-2">
                                <Package size={14} /> {t("orderItems")}
                            </h3>
                        </div>
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-xs sm:text-sm text-left">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 font-medium">{t("item")}</th>
                                        <th className="px-4 sm:px-6 py-3 font-medium text-right">{t("qty")}</th>
                                        <th className="px-4 sm:px-6 py-3 font-medium text-right">{t("price")}</th>
                                        <th className="px-4 sm:px-6 py-3 font-medium text-right">{t("total")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {order.items.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 sm:px-6 py-4 font-medium text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    {item.item_name}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-right text-gray-600">{item.quantity}</td>
                                            <td className="px-4 sm:px-6 py-4 text-right text-gray-600">{t('{{price, currency}}', { price: item.unit_price })}</td>
                                            <td className="px-4 sm:px-6 py-4 text-right font-medium text-gray-900">{t('{{price, currency}}', { price: item.quantity * item.unit_price })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-gray-50 p-4 sm:p-6 border-t">
                            {isEditing ? (
                                <div className="flex flex-col gap-3 text-sm">
                                    <div className="flex justify-between items-center w-full text-gray-600 px-2">
                                        <span>{t("subtotal")}</span>
                                        <input
                                            type="number"
                                            value={editForm.subtotal}
                                            onChange={(e) => setEditForm({ ...editForm, subtotal: Number(e.target.value) })}
                                            className="w-32 px-3 py-1 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center w-full text-gray-600 px-2">
                                        <span>{t("shipping")}</span>
                                        <input
                                            type="number"
                                            value={editForm.shipping_total}
                                            onChange={(e) => setEditForm({ ...editForm, shipping_total: Number(e.target.value) })}
                                            className="w-32 px-3 py-1 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center w-full text-red-600 px-2">
                                        <span>{t("discount")}</span>
                                        <input
                                            type="number"
                                            value={editForm.discount_total}
                                            onChange={(e) => setEditForm({ ...editForm, discount_total: Number(e.target.value) })}
                                            className="w-32 px-3 py-1 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center w-full text-lg font-bold text-gray-900 mt-2 pt-2 border-t px-2">
                                        <span>{t("totalAmount")}</span>
                                        <input
                                            type="number"
                                            value={editForm.final_order_total}
                                            onChange={(e) => setEditForm({ ...editForm, final_order_total: Number(e.target.value) })}
                                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-base font-bold text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            ) : (
                                (() => {
                                    // Calculate discount from promo_percentage if discount_total is 0 but promo code exists
                                    const calculatedDiscount = order.discount_total > 0
                                        ? order.discount_total
                                        : (order.applied_promo_code && order.promo_percentage)
                                            ? order.subtotal * (order.promo_percentage / 100)
                                            : 0;
                                    const effectiveTotal = calculatedDiscount > 0 && order.discount_total === 0
                                        ? order.subtotal - calculatedDiscount + order.shipping_total
                                        : order.final_order_total;

                                    return (
                                        <div className="flex flex-col gap-2 text-sm">
                                            <div className="flex justify-between w-full text-gray-600 px-2">
                                                <span>{t("subtotal")}</span>
                                                <span>{t('{{price, currency}}', { price: order.subtotal })}</span>
                                            </div>
                                            <div className="flex justify-between w-full text-gray-600 px-2">
                                                <span>{t("shipping")}</span>
                                                <span>{t('{{price, currency}}', { price: order.shipping_total })}</span>
                                            </div>
                                            {calculatedDiscount > 0 && <div className="flex justify-between w-full text-red-600 px-2">
                                                <span>{t("discount")} {order.applied_promo_code && <span className="text-xs">({order.applied_promo_code} - {order.promo_percentage}%)</span>}</span>
                                                <span><strong>-</strong> {t('{{price, currency}}', { price: calculatedDiscount })}</span>
                                            </div>}
                                            <div className="flex justify-between w-full text-lg font-bold text-gray-900 mt-2 pt-2 border-t px-2">
                                                <span>{t("totalAmount")}</span>
                                                <span>{t('{{price, currency}}', { price: effectiveTotal })}</span>
                                            </div>
                                        </div>
                                    );
                                })()
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <Trash2 className="text-red-600" size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{t("confirmDeleteOrder")}</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            {t("deleteOrderWarning", { orderId: order.order_id })}
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        {t("deleting")}
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        {t("deleteOrder")}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}


function orderActions({ status, awb }: { status: string, awb: string | null }) {
    switch (status) {
        case 'pending':
            return { pos: 'acceptOrder', neg: 'rejectOrder', status_pos: 'processing', status_neg: 'declined' };
        case 'processing':
            return { pos: 'markAsOutForDelivery', neg: 'cancelOrder', status_pos: 'out for delivery', status_neg: 'cancelled' };
        case 'out for delivery':
            return { pos: awb ? null : 'markAsShipped', neg: 'cancelOrder', status_pos: awb ? '' : 'shipped', status_neg: 'cancelled' };
        case 'shipped':
            return { pos: awb ? null : 'markAsDelivered', neg: 'returnOrder', status_pos: awb ? '' : 'completed', status_neg: 'returned' };
        default:
            return { pos: null, neg: null, status_pos: '', status_neg: '' };
    }
}