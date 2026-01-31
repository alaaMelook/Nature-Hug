'use client';

import { useState } from "react";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { useTranslation } from "react-i18next";
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, Phone, AlertCircle, Home } from "lucide-react";
import Link from "next/link";

interface TrackingScreenProps {
    initialOrder: OrderDetailsView | null;
    initialError: string | null;
    lang: string;
}

const statusSteps = [
    { key: 'pending', icon: Clock, label: 'Order Placed' },
    { key: 'processing', icon: Package, label: 'Processing' },
    { key: 'shipped', icon: Truck, label: 'Shipped' },
    { key: 'out for delivery', icon: Truck, label: 'Out for Delivery' },
    { key: 'delivered', icon: CheckCircle2, label: 'Delivered' },
];

const statusOrder = ['pending', 'processing', 'shipped', 'out for delivery', 'delivered'];

function getStatusIndex(status: string): number {
    const normalizedStatus = status.toLowerCase();
    const failedStatuses = ['cancelled', 'returned', 'refunded', 'failed', 'declined'];
    if (failedStatuses.includes(normalizedStatus)) return -1;
    return statusOrder.indexOf(normalizedStatus);
}

export function TrackingScreen({ initialOrder, initialError, lang }: TrackingScreenProps) {
    const { t } = useTranslation();
    const [searchValue, setSearchValue] = useState('');
    const [order, setOrder] = useState<OrderDetailsView | null>(initialOrder);
    const [error, setError] = useState<string | null>(initialError);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchValue.trim()) return;

        setLoading(true);
        setError(null);

        // Determine if it's an order ID or AWB
        const isOrderId = /^\d+$/.test(searchValue.trim());
        const params = isOrderId
            ? `?order=${searchValue.trim()}`
            : `?awb=${searchValue.trim()}`;

        window.location.href = `/${lang}/track${params}`;
    };

    const currentStatusIndex = order ? getStatusIndex(order.order_status) : -1;
    const isFailedStatus = currentStatusIndex === -1 && order;

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/30">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6">
                        <Home size={18} />
                        <span>{t('backToHome') || 'Back to Home'}</span>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        {t('tracking.title') || 'Track Your Order'}
                    </h1>
                    <p className="text-gray-600 max-w-md mx-auto">
                        {t('tracking.subtitle') || 'Enter your order number or AWB to track your shipment'}
                    </p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                placeholder={t('tracking.placeholder') || 'Enter Order ID or AWB number...'}
                                className="w-full px-5 py-4 pl-12 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-lg shadow-sm"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-colors font-medium shadow-sm disabled:opacity-50"
                        >
                            {loading ? t('loading') || 'Loading...' : t('tracking.search') || 'Track'}
                        </button>
                    </div>
                </form>

                {/* Error State */}
                {error && (
                    <div className="max-w-xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                        <AlertCircle size={20} />
                        <span>{t('tracking.notFound') || 'Order not found. Please check your order number or AWB.'}</span>
                    </div>
                )}

                {/* Order Details */}
                {order && (
                    <div className="max-w-3xl mx-auto">
                        {/* Status Timeline */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 mb-6">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">{t('tracking.orderNumber') || 'Order Number'}</p>
                                    <p className="text-2xl font-bold text-gray-900">#{order.order_id}</p>
                                </div>
                                {order.awb && (
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 mb-1">{t('tracking.awb') || 'AWB Number'}</p>
                                        <p className="text-lg font-semibold text-primary-600">{order.awb}</p>
                                    </div>
                                )}
                            </div>

                            {/* Failed Status Banner */}
                            {isFailedStatus && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-red-700 font-medium flex items-center gap-2">
                                        <AlertCircle size={18} />
                                        {t(`orderStatus.${order.order_status}`) || order.order_status}
                                    </p>
                                </div>
                            )}

                            {/* Progress Steps */}
                            {!isFailedStatus && (
                                <div className="relative">
                                    <div className="flex justify-between">
                                        {statusSteps.map((step, index) => {
                                            const Icon = step.icon;
                                            const isCompleted = index <= currentStatusIndex;
                                            const isCurrent = index === currentStatusIndex;

                                            return (
                                                <div key={step.key} className="flex flex-col items-center flex-1">
                                                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCompleted
                                                        ? 'bg-primary-600 text-white'
                                                        : 'bg-gray-100 text-gray-400'
                                                        } ${isCurrent ? 'ring-4 ring-primary-200' : ''}`}>
                                                        <Icon size={20} />
                                                    </div>
                                                    <p className={`mt-3 text-xs md:text-sm text-center font-medium ${isCompleted ? 'text-primary-600' : 'text-gray-400'
                                                        }`}>
                                                        {t(`tracking.${step.key}`) || step.label}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {/* Progress Line */}
                                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-0">
                                        <div
                                            className="h-full bg-primary-600 transition-all duration-500"
                                            style={{ width: `${Math.max(0, (currentStatusIndex / (statusSteps.length - 1)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Info Cards */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Shipping Address */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin size={18} className="text-primary-600" />
                                    {t('tracking.shippingAddress') || 'Shipping Address'}
                                </h3>
                                <p className="text-gray-600">{order.customer_name}</p>
                                <p className="text-gray-600">{order.shipping_street_address}</p>
                                <p className="text-gray-600">{order.shipping_governorate}</p>
                            </div>

                            {/* Contact Info */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Phone size={18} className="text-primary-600" />
                                    {t('tracking.contactInfo') || 'Contact Information'}
                                </h3>
                                {order.phone_numbers?.map((phone, idx) => (
                                    <p key={idx} className="text-gray-600">{phone}</p>
                                ))}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Package size={18} className="text-primary-600" />
                                {t('tracking.orderItems') || 'Order Items'}
                            </h3>
                            <div className="space-y-3">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                                        <div className="flex items-center gap-3">
                                            {item.product_image && (
                                                <img
                                                    src={item.product_image}
                                                    alt={item.product_name}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{item.product_name}</p>
                                                {item.variant_name && (
                                                    <p className="text-sm text-gray-500">{item.variant_name}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-600">×{item.quantity}</p>
                                            <p className="font-medium text-gray-900">{item.unit_price} EGP</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                                <span className="font-semibold text-gray-900">{t('total') || 'Total'}</span>
                                <span className="font-bold text-xl text-primary-600">{order.final_order_total} EGP</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!order && !error && (
                    <div className="text-center py-16">
                        <Package size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">
                            {t('tracking.enterNumber') || 'Enter your order number or AWB above to track your order'}
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
