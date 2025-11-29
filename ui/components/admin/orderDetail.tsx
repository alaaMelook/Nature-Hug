'use client';

import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Shipment } from "@/domain/entities/shipment/shipment";
import { City } from "@/domain/entities/shipment/city";
import { updateOrderAction, createShipmentAction, getCitiesAction } from "@/ui/hooks/admin/orders";
import { User, MapPin, Phone, Package, Calendar, DollarSign, X } from "lucide-react";
import { ShipmentTracking } from "./ShipmentTracking";

export function OrderDetailsModal({
    order,
    onClose,
}: {
    order: OrderDetailsView | null;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const [updating, setUpdating] = useState(false);
    const [cities, setCities] = useState<City[]>([]);

    useEffect(() => {
        if (order) {
            getCitiesAction().then(result => {
                if (result.success && result.cities) {
                    setCities(result.cities);
                } else {
                    console.error("Failed to fetch cities:", result.error);
                }
            });
        }
    }, [order]);

    if (!order) return null;

    const handleStatusChange = async (newStatus: string) => {
        setUpdating(true);
        try {
            let shipmentId = order.shipment_id;
            let awb = order.awb;

            // If status is 'processing', create shipment
            if (newStatus === 'processing' && !awb) {
                try {
                    const city = cities.find(c => c.cityName.toLowerCase().includes(order.shipping_governorate.toLowerCase()) || order.shipping_governorate.toLowerCase().includes(c.cityName.toLowerCase()));
                    const cityId = city ? city.cityId : 1; // Default to 1 or handle error

                    const shipmentData: Shipment = {
                        clientName: order.customer_name,
                        cityId: cityId,
                        address: order.shipping_street_address,
                        phone: order.phone_numbers[0] || "",
                        codAmount: order.final_order_total,
                        weight: 1, // Default weight
                    };

                    const shipmentResult = await createShipmentAction(shipmentData, order.shipping_governorate);
                    if (shipmentResult.skipped) {
                        toast.info(t("shipmentSkipped"));
                    } else if (shipmentResult.success && shipmentResult.data) {
                        toast.success(t("shipmentRequestSent"));
                        // Assuming the API returns AWB or similar identifier in the result
                        // Adjust based on actual API response structure
                        if (shipmentResult.data.AWB) awb = shipmentResult.data.AWB;
                        if (shipmentResult.data.ShipmentID) shipmentId = shipmentResult.data.ShipmentID;
                    } else {
                        throw new Error(shipmentResult.error);
                    }
                } catch (shipmentError) {
                    console.error("Shipment creation failed:", shipmentError);
                    toast.error(t("failedToCreateShipment"));
                }
            }

            // Update order status in DB
            const updateResult = await updateOrderAction({
                ...order,
                order_status: newStatus,
                shipment_id: shipmentId,
                awb: awb
            });
            if (!updateResult.success) throw new Error(updateResult.error);

            toast.success(t("orderStatusUpdated", { status: newStatus }));
            onClose();
        } catch (error) {
            console.error("Failed to update order:", error);
            toast.error(t("failedToUpdateOrder"));
        } finally {
            setUpdating(false);
        }
    };

    const actions = orderActions({ status: order.order_status });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-800">{t("orderId")} #{order.order_id}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${getStatusColor(order.order_status)}`}>
                            {order.order_status}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Customer & Shipping */}
                        <div className="space-y-6">
                            <section>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <User size={14} /> {t("customerDetails")}
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                            {order.customer_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{order.customer_name}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Phone size={12} />
                                                {order.phone_numbers[0] || "No phone"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <MapPin size={14} /> {t("shippingAddress")}
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-1">
                                    <p className="font-medium">{order.shipping_street_address}</p>
                                    <p>{order.shipping_governorate}</p>
                                </div>
                            </section>

                            {order.awb && (
                                <section>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Package size={14} /> {t("shipmentTracking")}
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
                                        <p><span className="font-medium">{t("awb")}:</span> {order.awb}</p>
                                        <ShipmentTracking awb={order.awb} />
                                    </div>
                                </section>
                            )}

                            <section>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Calendar size={14} /> {t("orderInfo")}
                                </h3>
                                <div className="text-sm text-gray-600">
                                    {t("placedOn")} {new Date(order.order_date).toLocaleDateString()} {t("at")} {new Date(order.order_date).toLocaleTimeString()}
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Order Items & Summary */}
                        <div className="flex flex-col h-full">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Package size={14} /> {t("orderItems")}
                            </h3>
                            <div className="bg-gray-50 rounded-lg flex-1 flex flex-col">
                                <div className="flex-1 overflow-y-auto p-2">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase border-b">
                                            <tr>
                                                <th className="px-4 py-2 font-medium">{t("item")}</th>
                                                <th className="px-4 py-2 font-medium text-right">{t("qty")}</th>
                                                <th className="px-4 py-2 font-medium text-right">{t("price")}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {order.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-3 font-medium text-gray-900">{item.item_name}</td>
                                                    <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-right text-gray-600">{item.unit_price}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-4 border-t bg-gray-100 rounded-b-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">{t("totalAmount")}</span>
                                        <span className="text-xl font-bold text-gray-900 flex items-center">
                                            {order.final_order_total} <span className="text-sm font-normal text-gray-500 ml-1">{t("EGP")}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                        {t("close")}
                    </button>
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
            </div>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'processing': return 'bg-blue-100 text-blue-800';
        case 'shipped': return 'bg-purple-100 text-purple-800';
        case 'delivered': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
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
            return { pos: 'markAsDelivered', neg: 'returnOrder', status_pos: 'completed', status_neg: 'returned' };
        default:
            return { pos: null, neg: null, status_pos: '', status_neg: '' };
    }
}