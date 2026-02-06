"use client";

import { OrderDetailsView, OrderItemView } from "@/domain/entities/views/admin/orderDetailsView";
import { ProductView } from "@/domain/entities/views/shop/productView";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
    acceptOrderAction,
    rejectOrderAction,
    cancelOrderAction,
    markAsOutForDeliveryAction,
    updateOrderAction,
    cancelShippedOrderAction,
    deleteOrderAction
} from "@/ui/hooks/admin/orders";
import { User, MapPin, Phone, Package, Calendar, ArrowLeft, X, CreditCard, Mail, Loader2, Trash2, Edit2, Save, Plus, Search } from "lucide-react";
import { ShipmentTracking } from "@/ui/components/admin/ShipmentTracking";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { statusColor } from "@/lib/utils/statusColors";
import { Shipment } from "@/domain/entities/shipment/shipment";
import { Governorate } from "@/domain/entities/database/governorate";

export function OrderDetailsScreen({ order, governorate, products }: { order: OrderDetailsView, governorate: Governorate, products: ProductView[] }) {
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
        is_prepaid: order.payment_status === 'paid',
        note: order.note || '',
        items: order.items.map(item => ({
            id: item.id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            product_id: null as number | null,
            variant_id: null as number | null,
            isNew: false,
        })),
    });

    // Product modal state
    const [showProductModal, setShowProductModal] = useState(false);
    const [productSearch, setProductSearch] = useState("");

    const filteredProducts = useMemo(() => {
        if (!productSearch.trim()) return products;
        const search = productSearch.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.slug.toLowerCase().includes(search)
        );
    }, [products, productSearch]);

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

    // Toggle Prepaid status directly without edit mode
    const handleTogglePrepaid = async () => {
        setUpdating(true);
        try {
            const newPaymentStatus = order.payment_status === 'paid' ? 'pending' : 'paid';
            const result = await updateOrderAction({
                order_id: order.order_id,
                payment_status: newPaymentStatus
            });
            if (result.success) {
                toast.success(newPaymentStatus === 'paid'
                    ? (t("markedAsPrepaid") || "Order marked as Prepaid")
                    : (t("removedPrepaid") || "Prepaid status removed"));
                router.refresh();
            } else {
                toast.error(result.error || t("failedToUpdateOrder"));
            }
        } catch (error) {
            console.error("Failed to toggle prepaid:", error);
            toast.error(t("failedToUpdateOrder"));
        } finally {
            setUpdating(false);
        }
    };



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
                    payment_status: order.payment_status,
                    final_order_total: order.final_order_total,
                    subtotal: order.subtotal,
                    shipping_total: order.shipping_total,
                    discount_total: order.discount_total,
                    applied_promo_code: order.applied_promo_code,
                    promo_percentage: order.promo_percentage,
                    note: order.note
                });

                // Check if order is Prepaid (payment_status is 'paid')
                const isPrepaid = order.payment_status === 'paid';
                const isCOD = order.payment_method.toLowerCase() !== 'online card';

                // Calculate effective total with discount (same logic as display)
                const calculatedDiscount = order.discount_total > 0
                    ? order.discount_total
                    : (order.applied_promo_code && order.promo_percentage)
                        ? order.subtotal * (order.promo_percentage / 100)
                        : 0;
                const effectiveTotal = calculatedDiscount > 0 && order.discount_total === 0
                    ? order.subtotal - calculatedDiscount + order.shipping_total
                    : order.final_order_total;

                // If Prepaid, COD = 0. Otherwise, check if it's a COD order.
                const codValue = isPrepaid ? 0 : (isCOD ? effectiveTotal : 0);

                console.log("[Shipment Debug] COD Calculation:", {
                    isPrepaid,
                    isCOD,
                    codValue,
                    calculatedDiscount,
                    effectiveTotal,
                    payment_method_lowercase: order.payment_method.toLowerCase()
                });

                // Build special instructions - include order notes if available
                let specialInstructions = "في حالة وجود مشكلة 01090998664";
                if (order.note && order.note.trim()) {
                    specialInstructions = `${order.note.trim()} | ${specialInstructions}`;
                }
                if (isPrepaid) {
                    specialInstructions = `[مدفوع مسبقاً] ${specialInstructions}`;
                }

                // Create shipment with correct API field names
                const shipmentData: Shipment = {
                    toAddress: order.shipping_street_address,
                    toPhone: order.phone_numbers[0] || "",
                    toMobile: order.phone_numbers[0] || "",
                    cod: codValue,  // 0 for Prepaid orders
                    fromAddress: "",
                    toConsigneeName: order.customer_name,
                    toCityID: governorate.cityID,
                    specialInstuctions: specialInstructions,  // Includes order notes
                    pieces: order.items.reduce((acc, item) => acc + item.quantity, 0),
                    fromCityID: 1078
                };

                console.log("[Shipment Debug] Full Shipment Request:", JSON.stringify(shipmentData, null, 2));

                result = await markAsOutForDeliveryAction(order, shipmentData);
            } else {
                // Only send order_id and order_status to avoid sending fields that don't exist in DB
                // Automatically set payment status to 'paid' if status is delivered or completed
                const extraFields: any = {};
                if (newStatus === 'delivered' || newStatus === 'completed') {
                    extraFields.payment_status = 'paid';
                }
                result = await updateOrderAction({
                    order_id: order.order_id,
                    order_status: newStatus,
                    ...extraFields
                });
            }

            if (result.success) {
                toast.success(t("orderStatusUpdated", { status: t(newStatus) || newStatus }));
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
            // Debug: Log what we're sending
            console.log("[OrderEdit] Saving changes with items:", editForm.items);
            console.log("[OrderEdit] removed_item_ids:", order.items
                .filter(originalItem => !editForm.items.some(editItem => editItem.id === originalItem.id))
                .map(item => item.id));

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
                // Note: payment_status (Prepaid) is now handled by standalone toggle button
                note: editForm.note || null,
                items: editForm.items.map((item) => ({
                    id: item.id, // undefined for new items
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    product_id: item.product_id,
                    variant_id: item.variant_id,
                    isNew: item.isNew,
                })),
                // Track which original items were removed
                removed_item_ids: order.items
                    .filter(originalItem => !editForm.items.some(editItem => editItem.id === originalItem.id))
                    .map(item => item.id)
                    .filter((id): id is number => id !== undefined),
            } as any);
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

    // Item editing helper functions
    const handleItemQuantityChange = (index: number, quantity: number) => {
        const newItems = [...editForm.items];
        newItems[index] = { ...newItems[index], quantity: Math.max(1, quantity) };
        recalculateTotals(newItems);
    };

    const handleItemPriceChange = (index: number, price: number) => {
        const newItems = [...editForm.items];
        newItems[index] = { ...newItems[index], unit_price: Math.max(0, price) };
        recalculateTotals(newItems);
    };

    const recalculateTotals = (items: typeof editForm.items) => {
        const newSubtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        const newFinalTotal = newSubtotal + editForm.shipping_total - editForm.discount_total;
        setEditForm(prev => ({
            ...prev,
            items,
            subtotal: newSubtotal,
            final_order_total: newFinalTotal
        }));
    };

    const handleShippingChange = (shipping: number) => {
        const newFinalTotal = editForm.subtotal + shipping - editForm.discount_total;
        setEditForm({ ...editForm, shipping_total: shipping, final_order_total: newFinalTotal });
    };

    const handleDiscountChange = (discount: number) => {
        const newFinalTotal = editForm.subtotal + editForm.shipping_total - discount;
        setEditForm({ ...editForm, discount_total: discount, final_order_total: newFinalTotal });
    };

    // Add new product to order
    const addItemToOrder = (product: ProductView) => {
        const newItem = {
            id: undefined as number | undefined,
            item_name: product.name,
            quantity: 1,
            unit_price: product.price,
            product_id: product.id,
            variant_id: product.variant_id || null,
            isNew: true,
        };
        const newItems = [...editForm.items, newItem];
        recalculateTotals(newItems);
        setShowProductModal(false);
        setProductSearch("");
    };

    // Remove item from order
    const removeItemFromOrder = (index: number) => {
        const newItems = editForm.items.filter((_, i) => i !== index);
        recalculateTotals(newItems);
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
            is_prepaid: order.payment_status === 'paid',
            note: order.note || '',
            items: order.items.map(item => ({
                id: item.id,
                item_name: item.item_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                product_id: null,
                variant_id: null,
                isNew: false,
            })),
        });
        setIsEditing(false);
        setShowProductModal(false);
        setProductSearch("");
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
                                <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide shadow-sm ${statusColor(order.order_status)}`}>
                                    {t(order.order_status) || order.order_status}
                                </span>
                                {/* Show Paid for completed/delivered orders, or Prepaid for orders marked as paid but not yet delivered */}
                                {(['delivered', 'completed'].includes(order.order_status.toLowerCase())) ? (
                                    <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide shadow-sm bg-green-100 text-green-700">
                                        {t("paid") || "Paid"}
                                    </span>
                                ) : order.payment_status === 'paid' ? (
                                    <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide shadow-sm bg-blue-100 text-blue-700">
                                        {t("prepaid") || "Prepaid"}
                                    </span>
                                ) : null}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Actions - Changed to flex-wrap on mobile and justified end */}
                <div className="flex flex-wrap justify-start gap-3 mt-4 sm:mt-0 sm:justify-end items-center">
                    <button
                        onClick={() => import("@/lib/utils/invoiceGenerator").then(mod => mod.generateInvoicePDF(order))}
                        className="flex-1 sm:flex-none px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors border border-gray-200 shadow-sm"
                    >
                        📄 {t("exportInvoice")}
                    </button>
                    {actions.neg && (
                        <button
                            onClick={() => handleStatusChange(actions.status_neg)}
                            disabled={updating}
                            className="flex-1 sm:flex-none px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-red-100"
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
                                className="flex-1 sm:flex-none px-4 py-2 bg-white text-gray-500 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-gray-200 italic"
                            >
                                ✍️ {t("markAsOutForDelivery")} ({t("manual") || "Manual"})
                            </button>
                        </>
                    )}
                    {actions.pos && (
                        <button
                            onClick={() => handleStatusChange(actions.status_pos, false)}
                            disabled={updating}
                            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-md flex items-center gap-2"
                        >
                            {order.order_status === 'processing' ? (
                                <><Package size={16} /> {t("sendToShipment") || "Send to Shipment"}</>
                            ) : (
                                t(actions.pos)
                            )}
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
                                    {order.payment_status === 'paid' ? (t("prepaid") || "Prepaid") : (t(order.payment_status) || order.payment_status)}
                                </span>
                            </div>
                            {/* Prepaid Toggle Button - Always visible (standalone action) */}
                            <div className="pt-2 border-t">
                                <button
                                    onClick={handleTogglePrepaid}
                                    disabled={updating}
                                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${order.payment_status === 'paid'
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                        } disabled:opacity-50`}
                                >
                                    {updating ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : order.payment_status === 'paid' ? (
                                        <>✓ {t("prepaid") || "Prepaid"} - {t("clickToRemove") || "Click to remove"}</>
                                    ) : (
                                        <>{t("markAsPrepaid") || "Mark as Prepaid (مدفوع مسبقاً)"}</>
                                    )}
                                </button>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    {t("prepaidDescription") || "When Prepaid, COD will be 0 when sending to shipping company"}
                                </p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Order Notes Section */}
                    <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2">
                            📝 {t("orderNotes") || "Order Notes"}
                        </h3>
                        {isEditing ? (
                            <textarea
                                value={editForm.note}
                                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                                placeholder={t("addOrderNotes") || "Add notes for this order..."}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        ) : (
                            <p className={`text-sm ${order.note ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                                {order.note || (t("noNotes") || "No notes for this order")}
                            </p>
                        )}
                        {order.note && !isEditing && (
                            <p className="text-xs text-gray-500 mt-2">
                                💡 {t("notesWillBeSentToShipping") || "Notes will be sent to the shipping company"}
                            </p>
                        )}
                    </motion.section>
                </div>

                {/* Right Column: Order Items & Summary - Takes full width on mobile */}
                <div className="lg:col-span-2 flex flex-col h-full">
                    <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border flex-1 flex flex-col overflow-hidden">
                        <div className="p-4 sm:p-6 border-b flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                                <Package size={14} /> {t("orderItems")}
                            </h3>
                            {isEditing && (
                                <button
                                    onClick={() => setShowProductModal(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                                >
                                    <Plus size={14} /> {t("addProduct") || "Add Product"}
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-xs sm:text-sm text-left">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 font-medium">{t("item")}</th>
                                        <th className="px-4 sm:px-6 py-3 font-medium text-right">{t("qty")}</th>
                                        <th className="px-4 sm:px-6 py-3 font-medium text-right">{t("price")}</th>
                                        <th className="px-4 sm:px-6 py-3 font-medium text-right">{t("total")}</th>
                                        {isEditing && <th className="px-4 sm:px-6 py-3 font-medium text-center w-16"></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isEditing ? (
                                        // Editable mode - use editForm.items
                                        editForm.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 sm:px-6 py-4 font-medium text-gray-900">
                                                    <div className="flex items-center gap-3">
                                                        {item.item_name}
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-right">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemQuantityChange(index, Number(e.target.value))}
                                                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-right">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unit_price}
                                                        onChange={(e) => handleItemPriceChange(index, Number(e.target.value))}
                                                        className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-right font-medium text-gray-900">
                                                    {t('{{price, currency}}', { price: item.quantity * item.unit_price })}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => removeItemFromOrder(index)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title={t("remove") || "Remove"}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        // View mode - use order.items
                                        order.items.map((item, index) => (
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
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-gray-50 p-4 sm:p-6 border-t">
                            {isEditing ? (
                                <div className="flex flex-col gap-3 text-sm">
                                    <div className="flex justify-between items-center w-full text-gray-600 px-2">
                                        <span>{t("subtotal")} <span className="text-xs text-gray-400">({t("autoCalculated")})</span></span>
                                        <span className="font-medium">{t('{{price, currency}}', { price: editForm.subtotal })}</span>
                                    </div>
                                    <div className="flex justify-between items-center w-full text-gray-600 px-2">
                                        <span>{t("shippingLabel")}</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={editForm.shipping_total}
                                            onChange={(e) => handleShippingChange(Number(e.target.value))}
                                            className="w-32 px-3 py-1 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center w-full text-red-600 px-2">
                                        <span>{t("discount")}</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={editForm.discount_total}
                                            onChange={(e) => handleDiscountChange(Number(e.target.value))}
                                            className="w-32 px-3 py-1 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center w-full text-lg font-bold text-gray-900 mt-2 pt-2 border-t px-2">
                                        <span>{t("totalAmount")} <span className="text-xs text-gray-400 font-normal">({t("editable") || "Editable"})</span></span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={editForm.final_order_total}
                                            onChange={(e) => setEditForm({ ...editForm, final_order_total: Number(e.target.value) })}
                                            className="w-36 px-3 py-2 border-2 border-green-500 rounded-lg text-lg text-right font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                                        />
                                    </div>
                                </div>
                            ) : (
                                (() => {
                                    // Calculate discount with multiple fallbacks:
                                    // 1. First check applied_promo_codes array (sum of all discounts)
                                    // 2. Then check discount_total
                                    // 3. Finally fallback to promo_percentage calculation
                                    let calculatedDiscount = 0;

                                    if (order.applied_promo_codes && Array.isArray(order.applied_promo_codes) && order.applied_promo_codes.length > 0) {
                                        // Sum all discounts from applied promo codes
                                        calculatedDiscount = order.applied_promo_codes.reduce((sum: number, promo: any) => sum + (promo.discount || 0), 0);
                                    } else if (order.discount_total > 0) {
                                        calculatedDiscount = order.discount_total;
                                    } else if (order.applied_promo_code && order.promo_percentage > 0) {
                                        calculatedDiscount = order.subtotal * (order.promo_percentage / 100);
                                    }

                                    // Always calculate the correct total
                                    const correctTotal = order.subtotal + order.shipping_total - calculatedDiscount;
                                    // Use calculated total if it's different from stored (indicates discount wasn't applied properly)
                                    const effectiveTotal = calculatedDiscount > 0 && order.final_order_total > correctTotal
                                        ? correctTotal
                                        : order.final_order_total;

                                    return (
                                        <div className="flex flex-col gap-2 text-sm">
                                            <div className="flex justify-between w-full text-gray-600 px-2">
                                                <span>{t("subtotal")}</span>
                                                <span>{t('{{price, currency}}', { price: order.subtotal })}</span>
                                            </div>
                                            <div className="flex justify-between w-full text-gray-600 px-2">
                                                <span>{t("shippingLabel")}</span>
                                                <span>{t('{{price, currency}}', { price: order.shipping_total })}</span>
                                            </div>
                                            {/* Show each promo code on a separate line */}
                                            {order.applied_promo_codes && Array.isArray(order.applied_promo_codes) && order.applied_promo_codes.length > 0 ? (
                                                order.applied_promo_codes.map((promo: any, index: number) => (
                                                    <div key={index} className="flex justify-between w-full text-red-600 px-2">
                                                        <span>
                                                            {t("discount")}
                                                            <span className="text-xs ml-1">
                                                                ({promo.code}{promo.auto_apply && ' 🔄'})
                                                            </span>
                                                        </span>
                                                        <span><strong>-</strong> {t('{{price, currency}}', { price: promo.discount || 0 })}</span>
                                                    </div>
                                                ))
                                            ) : calculatedDiscount > 0 && (
                                                <div className="flex justify-between w-full text-red-600 px-2">
                                                    <span>{t("discount")} {order.applied_promo_code && <span className="text-xs">({order.applied_promo_code} - {order.promo_percentage}%)</span>}</span>
                                                    <span><strong>-</strong> {t('{{price, currency}}', { price: calculatedDiscount })}</span>
                                                </div>
                                            )}
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

            {/* Product Selection Modal */}
            {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden m-4"
                    >
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{t("selectProduct") || "Select Product"}</h3>
                            <button
                                onClick={() => {
                                    setShowProductModal(false);
                                    setProductSearch("");
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                    placeholder={t("searchProducts") || "Search products..."}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[50vh] p-2">
                            {filteredProducts.length === 0 ? (
                                <p className="text-center text-gray-400 py-8">{t("noProductsFound") || "No products found"}</p>
                            ) : (
                                <div className="space-y-1">
                                    {filteredProducts.map(product => (
                                        <button
                                            key={product.slug}
                                            onClick={() => addItemToOrder(product)}
                                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">{product.name}</p>
                                                <p className="text-xs text-gray-500">{product.slug} • Stock: {product.stock}</p>
                                            </div>
                                            <span className="font-semibold text-primary-600">
                                                {t("{{price, currency}}", { price: product.price })}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
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