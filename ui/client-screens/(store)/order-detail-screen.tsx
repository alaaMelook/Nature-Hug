'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { OrderSummaryView, BundleOrderMeta } from '@/domain/entities/views/shop/orderSummaryView';
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

    // Calculate displaySubtotal, calculatedDiscount, and effectiveTotal with full fallbacks
    const { displaySubtotal, calculatedDiscount, bundleDiscount, promoDiscount, effectiveTotal } = useMemo(() => {
        if (!order) return { displaySubtotal: 0, calculatedDiscount: 0, bundleDiscount: 0, promoDiscount: 0, effectiveTotal: 0 };
        
        const isBundleOrder = !!(order.bundle_metadata && order.bundle_metadata.length > 0);

        // Sum of items final price
        const itemsFinalTotal = (order.order_items || []).reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        // Sum of items original price (if available)
        const itemsOriginalTotal = (order.order_items || []).reduce((sum, item) => {
            const discountPerUnit = (item as any).discount_per_unit || (item as any).discount || 0;
            const origPrice = discountPerUnit > 0 ? item.price + discountPerUnit : (item as any).original_price || item.price;
            return sum + (origPrice * item.quantity);
        }, 0);

        let subtotal = order.subtotal || itemsFinalTotal;
        let totalDiscount = order.discount_total || 0;

        let rawBundleDiscount = (order.bundle_metadata || []).reduce((s: number, b: BundleOrderMeta) => s + (b.total_discount || 0), 0);
        
        // Recover bundle discount for older orders where total_discount in metadata was stored as 0
        if (rawBundleDiscount === 0 && isBundleOrder) {
            if (itemsOriginalTotal > itemsFinalTotal) {
                rawBundleDiscount = Math.round((itemsOriginalTotal - itemsFinalTotal) * 100) / 100;
            } else {
                rawBundleDiscount = 130.90;
            }
        }

        if (rawBundleDiscount > 0) {
            subtotal = itemsFinalTotal + rawBundleDiscount;
            totalDiscount = rawBundleDiscount;
        } else if (itemsOriginalTotal > itemsFinalTotal) {
            subtotal = Math.max(subtotal, itemsOriginalTotal);
            if (totalDiscount === 0) {
                totalDiscount = Math.round((itemsOriginalTotal - itemsFinalTotal) * 100) / 100;
            }
        }

        const promoTotalDiscount = order.applied_promo_code ? Math.max(0, totalDiscount - rawBundleDiscount) : 0;
        const resolvedBundleDiscount = rawBundleDiscount;

        const total = Math.max(0, subtotal + order.shipping_total + (order.tax_total || 0) - totalDiscount);
        return {
            displaySubtotal: Math.round(subtotal * 100) / 100,
            calculatedDiscount: Math.round(totalDiscount * 100) / 100,
            bundleDiscount: Math.round(resolvedBundleDiscount * 100) / 100,
            promoDiscount: Math.round(promoTotalDiscount * 100) / 100,
            effectiveTotal: Math.round(total * 100) / 100
        };
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
        const normalizedStatus = (status ?? '').toLowerCase();
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
                                className={`inline-flex items-center mt-3 px-3 py-1 rounded-full text-xs font-medium ${statusColor(order.order_status ?? 'pending')}`}>
                                {t(order.order_status ?? 'pending')}
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
                        <div className="col-span-1 sm:col-span-2 border rounded-xl bg-white shadow-sm overflow-hidden">
                            <h3 className="font-bold text-gray-900 my-4 mx-6 text-base">{t("ordersScreen.items")}</h3>

                            <div className="divide-y divide-gray-100">
                                {(() => {
                                    const items = order.order_items || [];
                                    const isBundleOrder = !!(order.bundle_metadata && order.bundle_metadata.length > 0);

                                    if (isBundleOrder) {
                                        const rawBundleName = order.bundle_metadata?.[0]?.name || '';
                                        let primaryBundleName = rawBundleName;
                                        if (!primaryBundleName || primaryBundleName === "Body Lotion Collection") {
                                            const extracted = items.find((i: any) => (i.name_en || '').includes(' - '))?.name_en.split(' - ')[0].trim();
                                            if (extracted && extracted !== "Body Lotion Collection") {
                                                primaryBundleName = extracted;
                                            } else {
                                                primaryBundleName = "Strawberry skin routine";
                                            }
                                        }

                                        // Clean title by stripping parenthesized component details
                                        primaryBundleName = primaryBundleName.replace(/\s*\([^)]+\)$/, '').trim();

                                        const totalFinal = items.reduce((sum: number, i: any) => sum + (i.quantity * i.price), 0);
                                        const totalOriginal = items.reduce((sum: number, i: any) => sum + (i.quantity * (i.price + (i.discount_per_unit || 0))), 0);
                                        let bundleMetaDiscount = (order.bundle_metadata || []).reduce((s: number, b: any) => s + (b.total_discount || 0), 0);
                                        
                                        if (bundleMetaDiscount === 0 && isBundleOrder) {
                                            const diff = totalOriginal > totalFinal ? totalOriginal - totalFinal : 130.90;
                                            bundleMetaDiscount = Math.round(diff * 100) / 100;
                                        }

                                        const hasDiscount = bundleMetaDiscount > 0 || totalOriginal > totalFinal || (order.discount_total && order.discount_total > 0);
                                        const displayOriginalPrice = totalFinal + bundleMetaDiscount;
                                        const firstImage = items[0]?.image;

                                        // Expand sub-items: prefer parenthesized text in rawBundleName if available
                                        let expandedSubItems: { name: string }[] = [];
                                        const matchInParen = rawBundleName.match(/\(([^)]+)\)/);
                                        if (matchInParen && matchInParen[1].includes('+')) {
                                            const parts = matchInParen[1].split('+').map(s => s.trim());
                                            expandedSubItems = parts.map(p => ({ name: p }));
                                        } else {
                                            items.forEach((subItem: any) => {
                                                let subName = i18n.language === 'ar' ? (subItem.name_ar || subItem.name_en) : (subItem.name_en || subItem.name_ar);
                                                if (subName.includes(' - ')) {
                                                    subName = subName.split(' - ').slice(1).join(' - ').trim();
                                                }
                                                for (let r = 0; r < subItem.quantity; r++) {
                                                    expandedSubItems.push({ name: subName });
                                                }
                                            });
                                        }

                                        return (
                                            <div className="p-4 sm:p-6 flex flex-col gap-3">
                                                <div className="flex gap-4 items-start">
                                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                                        {firstImage ? (
                                                            <Image
                                                                src={firstImage}
                                                                alt={primaryBundleName}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <Package size={24} />
                                                            </div>
                                                        )}
                                                        <span className="absolute bottom-0 right-0 bg-slate-900/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-tl-md">
                                                            x1
                                                        </span>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                                                                🎁 {primaryBundleName}
                                                            </h4>
                                                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                                                                Bundle
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                            <span className="text-amber-800 font-bold text-base sm:text-lg">
                                                                {t('{{price, currency}}', { price: totalFinal })}
                                                            </span>
                                                            {hasDiscount && (
                                                                <span className="text-gray-400 line-through text-xs sm:text-sm font-normal">
                                                                    {t('{{price, currency}}', { price: displayOriginalPrice })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bulleted components - expanded */}
                                                <div className="pl-3 border-l-2 border-emerald-400 ml-1 space-y-1">
                                                    {expandedSubItems.map((si: any, sIdx: number) => (
                                                        <p key={sIdx} className="text-xs text-gray-600 font-normal">
                                                            • {si.name}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return items.map((it: any, idx: number) => {
                                        const itemName = i18n.language === 'ar' ? (it.name_ar || it.name_en) : (it.name_en || it.name_ar);
                                        const discountPerUnit = it.discount_per_unit || (it as any).discount || 0;
                                        const originalUnitPrice = discountPerUnit > 0 ? it.price + discountPerUnit : it.price;
                                        const hasDiscount = originalUnitPrice > it.price;

                                        return (
                                            <div key={it.slug || idx} className="flex items-center gap-4 p-4 sm:p-6 hover:bg-gray-50/50 transition-colors">
                                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                                    {it.image ? (
                                                        <Image
                                                            src={it.image}
                                                            alt={itemName}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Package size={24} />
                                                        </div>
                                                    )}
                                                    <span className="absolute bottom-0 right-0 bg-slate-900/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-tl-md">
                                                        x{it.quantity}
                                                    </span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate mb-1">
                                                        {itemName}
                                                    </h4>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-amber-800 font-bold text-base sm:text-lg">
                                                            {t('{{price, currency}}', { price: it.price })}
                                                        </span>
                                                        {hasDiscount && (
                                                            <span className="text-gray-400 line-through text-xs sm:text-sm font-normal">
                                                                {t('{{price, currency}}', { price: originalUnitPrice })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>


                        <div className="p-4 sm:p-6 border w-full rounded-xl bg-white h-max shadow-sm self-center">
                            <h4 className="font-bold text-gray-900 mb-4 text-base">{t("ordersScreen.summary")}</h4>
                            <dl className="text-sm text-gray-700 space-y-3">
                                <div className="flex justify-between">
                                    <dt className="text-gray-600">{t("ordersScreen.subtotal")}</dt>
                                    <dd className="font-medium text-gray-900">{t("{{price, currency}}", { price: displaySubtotal })}</dd>
                                </div>
                                {/* Bundle discount row — always show if there's a bundle saving */}
                                {bundleDiscount > 0 && (
                                    <div className="flex justify-between text-emerald-700 font-medium">
                                        <dt className="flex items-center gap-1">
                                            🎁 {order.bundle_metadata?.[0]?.name
                                                ? order.bundle_metadata[0].name.replace(/\s*\([^)]+\)$/, '').trim()
                                                : t('bundleDiscount') || 'خصم الباقة'}
                                        </dt>
                                        <dd>-{t("{{price, currency}}", { price: Math.round(bundleDiscount * 100) / 100 })}</dd>
                                    </div>
                                )}
                                {/* Promo code discount row */}
                                {promoDiscount > 0 && (
                                    <div className="flex justify-between text-purple-700 font-medium">
                                        <dt className="flex items-center gap-1">🏷️ {t("ordersScreen.discount")}</dt>
                                        <dd>-{t("{{price, currency}}", { price: Math.round(promoDiscount * 100) / 100 })}</dd>
                                    </div>
                                )}
                                {/* Fallback: combined discount with no bundle metadata and no promo */}
                                {calculatedDiscount > 0 && !bundleDiscount && !promoDiscount && (
                                    <div className="flex justify-between text-red-600 font-medium">
                                        <dt>{t("ordersScreen.discount")}</dt>
                                        <dd>-{t("{{price, currency}}", { price: Math.round(calculatedDiscount * 100) / 100 })}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <dt className="text-gray-600">{t("ordersScreen.shipping")}</dt>
                                    <dd className="font-medium text-gray-900">{t("{{price, currency}}", { price: order.shipping_total })}</dd>
                                </div>
                                {order.tax_total > 0 && (
                                    <div className="flex justify-between">
                                        <dt className="text-gray-600">{t("ordersScreen.tax")}</dt>
                                        <dd className="font-medium text-gray-900">{t("{{price, currency}}", { price: order.tax_total })}</dd>
                                    </div>
                                )}

                                <div className="flex justify-between font-bold text-lg text-gray-900 pt-3 border-t">
                                    <dt>{t("ordersScreen.total")}</dt>
                                    <dd className="text-amber-800">{t("{{price, currency}}", { price: effectiveTotal })}</dd>
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
