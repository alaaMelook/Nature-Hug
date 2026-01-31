'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { OrderSummaryView } from '@/domain/entities/views/shop/orderSummaryView';
import Link from 'next/link';
import Image from 'next/image';
import { statusColor } from "@/lib/utils/statusColors";
import { useSupabase } from "@/ui/hooks/useSupabase";
import { useTranslation, Trans } from "react-i18next";

import { cancelUserOrderAction } from "@/ui/hooks/store/userOrderActions";
import { toast } from "sonner";
import { Package, Clock, Truck, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

export default function OrderDetailScreen({ order, fromCheckout }: {
    order: OrderSummaryView | null,
    fromCheckout?: boolean | string | null
}) {
    const { t, i18n } = useTranslation();
    const { user, loading } = useSupabase();
    const [formatted, setFormatted] = useState('');

    // Calculate discount from promo_percentage if discount_total is 0 but promo code exists
    const { calculatedDiscount, effectiveTotal } = useMemo(() => {
        if (!order) return { calculatedDiscount: 0, effectiveTotal: 0 };
        const discount = order.discount_total > 0
            ? order.discount_total
            : (order.applied_promo_code && order.promo_percentage)
                ? order.subtotal * (order.promo_percentage / 100)
                : 0;
        const total = discount > 0 && order.discount_total === 0
            ? order.subtotal - discount + order.shipping_total + order.tax_total
            : order.grand_total;
        return { calculatedDiscount: discount, effectiveTotal: total };
    }, [order]);

    useEffect(() => {
        if (order && order.created_at) {
            const date = new Date(order.created_at);
            setFormatted(t("{{date, datetime}}", { date: date }));
        }
    }, []);

    const handleCancel = async () => {
        if (!order) return;
        if (!confirm(t("ordersScreen.confirmCancel"))) return;

        const result = await cancelUserOrderAction(order.order_id);
        if (result.success) {
            toast.success(t("ordersScreen.cancelSuccess"));
        } else {
            toast.error(t("ordersScreen.cancelFailed"));
        }
    };

    // Order Tracking Timeline Component
    const OrderTrackingTimeline = ({ status, t }: { status: string; t: any }) => {
        const isArabic = i18n.language === 'ar';

        const statusSteps = [
            { key: 'pending', icon: Clock, label: isArabic ? 'تم الطلب' : 'Order Placed' },
            { key: 'processing', icon: Package, label: isArabic ? 'جاري التجهيز' : 'Preparing' },
            { key: 'shipped', icon: Truck, label: isArabic ? 'تم الشحن' : 'Shipped' },
            { key: 'out for delivery', icon: Truck, label: isArabic ? 'في الطريق إليك' : 'Out for Delivery' },
            { key: 'delivered', icon: CheckCircle2, label: isArabic ? 'تم التسليم' : 'Delivered' },
        ];

        const statusOrder = ['pending', 'processing', 'shipped', 'out for delivery', 'delivered', 'completed'];
        const failedStatuses = ['cancelled', 'returned', 'refunded', 'failed', 'declined'];
        const normalizedStatus = status.toLowerCase();
        const isFailed = failedStatuses.includes(normalizedStatus);
        const currentIndex = isFailed ? -1 : statusOrder.indexOf(normalizedStatus === 'completed' ? 'delivered' : normalizedStatus);

        if (isFailed) {
            return (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-3 text-red-700">
                        {normalizedStatus === 'returned' || normalizedStatus === 'refunded' ? (
                            <RotateCcw size={24} />
                        ) : (
                            <XCircle size={24} />
                        )}
                        <div>
                            <p className="font-semibold">{t(normalizedStatus) || status}</p>
                            <p className="text-sm text-red-600">{t("tracking.orderCancelled")}</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="mt-6 p-4 md:p-6 bg-gradient-to-r from-primary-50/50 to-amber-50/50 rounded-xl border border-primary-100">
                <h3 className="font-semibold text-gray-900 mb-6 text-center">{isArabic ? 'حالة الطلب' : 'Order Status'}</h3>
                <div className="relative">
                    {/* Progress Line Background */}
                    <div className="hidden md:block absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full" style={{ left: '10%', right: '10%' }} />
                    {/* Progress Line Filled */}
                    <div
                        className="hidden md:block absolute top-6 h-1 bg-primary-500 rounded-full transition-all duration-500"
                        style={{
                            left: '10%',
                            width: `${Math.max(0, (currentIndex / (statusSteps.length - 1)) * 80)}%`
                        }}
                    />

                    <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-0">
                        {statusSteps.map((step, index) => {
                            const Icon = step.icon;
                            const isCompleted = index <= currentIndex;
                            const isCurrent = index === currentIndex;

                            return (
                                <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-0 flex-1">
                                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${isCompleted
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white text-gray-400 border-2 border-gray-200'
                                        } ${isCurrent ? 'ring-4 ring-primary-200 scale-110' : ''}`}>
                                        <Icon size={20} />
                                    </div>
                                    <p className={`md:mt-3 text-xs md:text-sm text-center font-medium ${isCompleted ? 'text-primary-700' : 'text-gray-400'
                                        }`}>
                                        {step.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // If order is null, show a friendly fallback UI. If `fromCheckout` is true, still show thank-you banner.
    if (!order) {
        return (
            <div className="max-w-3xl mx-auto my-16 p-6 bg-white rounded-lg shadow text-center">
                {t("ordersScreen.notFound")}
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-4 lg:mx-auto my-10 p-6 bg-white rounded-lg shadow">
            {fromCheckout && (
                <>
                    <div
                        className=" p-4 rounded-lg bg-gradient-to-r from-green-500 to-green-300 text-white text-center">
                        <h2 className="text-2xl font-semibold">{t("ordersScreen.thankYou")}</h2>
                        <p className="mt-1 text-sm opacity-90">{t("ordersScreen.preparing")}</p>
                    </div>
                </>
            )} {!user && !loading && (
                <div
                    className="p-4 text-black text-center">
                    <h2 className="text-lg font-semibold">
                        <Trans i18nKey="ordersScreen.signupPrompt">
                            You can always come back later to this page easily, if you <Link href={'/login'} className={'text-teal-600 text-decoration-line: underline'}>signed up here</Link>
                        </Trans>
                    </h2>
                </div>
            )}
            {order && (
                <>
                    <div className=" mt-6 flex  justify-between items-start gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-amber-800">{t("ordersScreen.orderNumber", { id: order.order_id })}</h1>
                            <p className="text-sm text-gray-600">{t("ordersScreen.placed", { date: formatted })}</p>
                            <div
                                className={`inline-flex items-center mt-3 px-3 py-1 rounded-full text-xs font-medium ${statusColor(order.order_status)}`}>
                                {t(order.order_status)}
                            </div>
                        </div>

                        <div className="text-left md:text-right mt-4 md:mt-0">
                            <p className="text-sm text-gray-500">{t("ordersScreen.items")}</p>
                            <p className="text-lg font-semibold">{order.item_count}</p>
                        </div>
                    </div>

                    {/* Order Tracking Timeline */}
                    <OrderTrackingTimeline status={order.order_status} t={t} />

                    <div className="mt-6 flex flex-col sm:grid sm:grid-cols-3 gap-6">
                        <div className="col-span-1 sm:col-span-2 border rounded-md">

                            <h3 className="font-semibold my-3 mx-10 ">{t("ordersScreen.items")}</h3>
                            <div className="divide-y divide-gray-100 ">
                                {(order.order_items || []).map((it) => (
                                    <div key={it.slug} className="flex flex-row items-start sm:items-center gap-4 p-4">
                                        {it.image ? <Image
                                            src={it.image}
                                            alt={it.slug}
                                            width={64}
                                            height={64}
                                            className="w-16 h-16 bg-gray-100 rounded-md object-cover"
                                        /> : <Package className="w-16 h-16 bg-gray-100 rounded-md object-cover" />}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium"> {i18n.language === 'ar' ? it.name_ar ?? it.name_en : it.name_en} </p>
                                            <p className="text-xs text-gray-500 mt-1">{t("ordersScreen.qty")} {it.quantity} </p>
                                        </div>
                                        <div>
                                            <p className="text-md font-semibold text-gray-700">{it.quantity} x {t('{{price, currency}}', { price: it.price })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>


                        <div className="p-4 border w-full rounded-md bg-white h-max shadow-sm self-center items-center">
                            <h4 className="font-semibold mb-3">{t("ordersScreen.summary")}</h4>
                            <dl className="text-sm text-gray-700 space-y-2">
                                <div className="flex justify-between">
                                    <dt>{t("ordersScreen.subtotal")}</dt>
                                    <dd>{t("{{price, currency}}", { price: order.subtotal })}</dd>
                                </div>
                                {calculatedDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <dt>{t("ordersScreen.discount")}</dt>
                                        <dd>-{t("{{price, currency}}", { price: calculatedDiscount })}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <dt>{t("ordersScreen.shipping")}</dt>
                                    <dd>{t("{{price, currency}}", { price: order.shipping_total })}</dd>
                                </div>
                                {order.tax_total > 0 && (
                                    <div className="flex justify-between">
                                        <dt>{t("ordersScreen.tax")}</dt>
                                        <dd>{t("{{price, currency}}", { price: order.tax_total })}</dd>
                                    </div>
                                )}

                                <div className="flex justify-between font-semibold text-lg">
                                    <dt>{t("ordersScreen.total")}</dt>
                                    <dd>{t("{{price, currency}}", { price: effectiveTotal })}</dd>
                                </div>
                            </dl>

                            {order.applied_promo_code && (
                                <div className="mt-4 p-2 bg-green-50 text-green-800 rounded text-sm">
                                    <Trans i18nKey="ordersScreen.promoApplied" values={{ code: order.applied_promo_code, percent: order.promo_percentage ?? 0 }} components={{ b: <b /> }}>
                                        {t("ordersScreen.promoApplied", { code: order.applied_promo_code, percent: order.promo_percentage ?? 0 })}
                                    </Trans>
                                </div>
                            )}

                            <Link href="/"
                                className="block mt-4 text-center px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800"> {t("ordersScreen.orderAgain")}</Link>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-md col-span-3">
                            <div>
                                <p className="text-sm text-gray-600">{t("ordersScreen.paymentStatus")}</p>
                                <p className="font-medium">{t(order.payment_status)} {order.payment_status === 'unpaid' && (
                                    <Link href={'#'} className={'ml-10 text-teal-800'}>{t("ordersScreen.payNow")}</Link>)}</p>
                            </div>
                            <div className="text-left sm:text-right w-full sm:w-auto">
                                <p className="text-sm text-gray-500">{t("ordersScreen.grandTotal")}</p>
                                <p className="text-2xl font-extrabold">{t("{{price, currency}}", { price: effectiveTotal })}</p>
                            </div>
                        </div>
                    </div>
                    {['pending', 'processing'].includes(order.order_status) && (
                        <div className="min-w-full flex justify-end pt-5">
                            <button
                                onClick={handleCancel}
                                className="text-sm text-red-600 hover:text-red-800 underline "
                            >
                                {t("ordersScreen.cancelOrder")}
                            </button>
                        </div>
                    )}
                </>
            )}
            {!order && user && (
                <div className="py-12">
                    <h3 className="text-xl font-semibold text-gray-800">{t("ordersScreen.orderNotFoundTitle")}</h3>
                    <p className="mt-3 text-sm text-gray-600">{t("ordersScreen.orderNotFoundDesc")}</p>

                    <div className="mt-6 flex flex-col sm:flex-row sm:justify-center gap-3">
                        <Link href="/orders" className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800">{t("ordersScreen.viewMyOrders")}</Link>
                        <Link href="/contact-us"
                            className="px-4 py-2 border border-gray-200 rounded text-gray-700 hover:bg-gray-50">{t("ordersScreen.contactSupport")}</Link>
                    </div>
                </div>
            )}

        </div>
    );
}
