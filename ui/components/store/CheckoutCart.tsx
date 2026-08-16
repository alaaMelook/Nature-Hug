"use client";
import { useCart } from "@/ui/providers/CartProvider";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Tag, Sparkles, Gift } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Governorate } from "@/domain/entities/database/governorate";
import Image from "next/image";

interface PotentialPromo {
    id: number;
    min_order_amount: number;
    amount_off?: number;
    percentage_off?: number;
    free_shipping?: boolean;
}

export function CheckoutCart({ selectedGovernorate, onPurchase, customerId }: {
    selectedGovernorate: Governorate | null,
    onPurchase: () => void,
    customerId?: number,
}) {
    const { t } = useTranslation();
    const { cart, getCartTotal, applyPromoCode, removePromoCode, applyAutoPromoCodes } = useCart()
    const [promoCode, setPromoCode] = useState<string>('');
    const products = cart.items;
    const [autoApplied, setAutoApplied] = useState(false);
    const [potentialPromos, setPotentialPromos] = useState<PotentialPromo[]>([]);

    // Fetch potential promos that customer could unlock
    useEffect(() => {
        const fetchPotentialPromos = async () => {
            try {
                const response = await fetch('/api/store/auto-apply-promos' + (customerId ? `?customerId=${customerId}` : ''));
                if (!response.ok) return;
                const { promoCodes } = await response.json();

                // Filter to only show promos with min_order_amount that are not yet applied
                const potentials = promoCodes.filter((p: any) =>
                    p.min_order_amount &&
                    p.min_order_amount > cart.netTotal &&
                    !cart.promoCodes.some(applied => applied.id === p.id)
                );
                setPotentialPromos(potentials);
            } catch (error) {
                console.error('Failed to fetch potential promos:', error);
            }
        };

        if (cart.items.length > 0) {
            fetchPotentialPromos();
        }
    }, [cart.netTotal, cart.items.length, customerId, cart.promoCodes]);

    // Auto-apply eligible promo codes when component mounts or cart total changes
    useEffect(() => {
        if (cart.items.length > 0) {
            // Re-apply auto promos when cart changes (to catch min_order_amount thresholds)
            applyAutoPromoCodes(customerId);
            setAutoApplied(true);
        }
    }, [cart.items.length, customerId, cart.netTotal]);

    return (
        <section className="w-full md:w-1/3 flex flex-col space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24">
                {/* Back to Cart Link */}
                <Link href={'/cart'}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors duration-200 mb-6 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">{t('checkout.backToCart')}</span>
                </Link>

                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('checkout.orderSummary')}</h2>

                {/* Cart Items List */}
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {cart.items.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-4">{t('checkout.cartEmpty')}</p>
                    ) : (
                        products.map((item) => {
                            const isBundle = item.slug?.startsWith('bundle-') || item.product_type === 'bundle';

                            // For bundles: extract clean bundle name (without the "(variant1 + variant2)" suffix)
                            const bundleBaseName = isBundle
                                ? (item.name?.replace(/\s*\([^)]+\)$/, '').trim() || item.name)
                                : item.name;

                            // Get selected variants as sub-items list
                            let selectedVariants: { id?: number; name: string; price?: number; image?: string | null }[] =
                                isBundle && item.selected_variants && Object.keys(item.selected_variants).length > 0
                                    ? Object.values(item.selected_variants as Record<string, any>)
                                    : [];

                            if (isBundle && selectedVariants.length === 0 && item.name && item.name.includes('(')) {
                                const matchInParen = item.name.match(/\(([^)]+)\)/);
                                if (matchInParen && matchInParen[1].includes('+')) {
                                    const parts = matchInParen[1].split('+').map(s => s.trim());
                                    selectedVariants = parts.map(p => ({ name: p }));
                                }
                            }

                            const hasDiscount = !!(item.original_price && item.original_price > item.price);

                            return (
                                <div key={item.slug} className={`py-3 ${isBundle ? 'border border-emerald-100 rounded-xl p-3 bg-emerald-50/40' : 'flex gap-4 py-2'}`}>
                                    {isBundle ? (
                                        /* === Bundle Item Layout === */
                                        <div className="flex flex-col gap-2">
                                            {/* Bundle header: image + name + badge */}
                                            <div className="flex gap-3 items-start">
                                                <div className="w-14 h-14 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-emerald-200 relative">
                                                    <Image
                                                        className="w-full h-full object-cover"
                                                        fill={true}
                                                        src={item.image || "https://placehold.co/100x100/E2E8F0/FFF?text=No+Image"}
                                                        alt={bundleBaseName}
                                                    />
                                                    <span className="absolute bottom-0 right-0 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded-tl-md font-medium">
                                                        x{item.quantity}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-sm font-bold text-emerald-900 leading-snug">
                                                            🎁 {bundleBaseName}
                                                        </span>
                                                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700 border border-emerald-200 rounded tracking-wide">
                                                            Bundle
                                                        </span>
                                                    </div>
                                                    {/* Price */}
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-primary-600">
                                                            {t("{{price, currency}}", { price: (item.price ?? 0) * (item.quantity ?? 1) })}
                                                        </span>
                                                        {hasDiscount && (
                                                            <span className="text-xs text-gray-400 line-through">
                                                                {t("{{price, currency}}", { price: (item.original_price ?? 0) * (item.quantity ?? 1) })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sub-items: selected variants */}
                                            {selectedVariants.length > 0 && (
                                                <div className="pl-2 border-l-2 border-emerald-300 ml-1 space-y-1 mt-1">
                                                    {selectedVariants.map((sv, si) => (
                                                        <div key={si} className="flex justify-between items-center text-xs text-gray-700">
                                                            <span className="font-medium">• {sv.name}</span>
                                                            {sv.price && sv.price > 0 && (
                                                                <span className="text-gray-500 font-mono text-[11px] font-semibold">
                                                                    {t("{{price, currency}}", { price: sv.price })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* === Regular Item Layout === */
                                        <div className="flex gap-4 w-full">
                                            <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative">
                                                <Image
                                                    className="w-full h-full object-cover"
                                                    fill={true}
                                                    src={item.image || "https://placehold.co/100x100/E2E8F0/FFF?text=No+Image"}
                                                    alt={item.name}
                                                />
                                                <span className="absolute bottom-0 right-0 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded-tl-md font-medium">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{item.name}</p>
                                                <div className="mt-1">
                                                    {item.original_price || (item.discount && item.discount > 0) ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-primary-600">
                                                                {t("{{price, currency}}", { price: ((item.price ?? 0) - (item.discount ?? 0)) * (item.quantity ?? 1) })}
                                                            </span>
                                                            <span className="text-xs text-gray-400 line-through">
                                                                {t("{{price, currency}}", { price: ((item.original_price || item.price) ?? 0) * (item.quantity ?? 1) })}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm font-semibold text-gray-700">
                                                            {t("{{price, currency}}", { price: (item.price ?? 0) * (item.quantity ?? 1) })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })

                    )}
                </div>

                {/* Promo Codes */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                    {/* Applied Promo Codes List */}
                    {cart.promoCodes && cart.promoCodes.length > 0 && (
                        <div className="space-y-3">
                            {cart.promoCodes.map((promo) => (
                                <div key={promo.id} className={`rounded-xl p-4 ${promo.auto_apply ? 'bg-purple-50 border border-purple-200' : 'bg-green-50 border border-green-200'}`}>
                                    {/* Header Row */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {promo.auto_apply ? (
                                                <Sparkles className="w-4 h-4 text-purple-600" />
                                            ) : (
                                                <Tag className="w-4 h-4 text-green-600" />
                                            )}
                                            <span className={`text-sm font-semibold ${promo.auto_apply ? 'text-purple-700' : 'text-green-700'}`}>
                                                {promo.auto_apply ? (t('autoDiscount') || 'خصم تلقائي') : promo.code.toUpperCase()}
                                            </span>
                                        </div>
                                        {!promo.auto_apply && (
                                            <button
                                                onClick={() => removePromoCode(promo.id)}
                                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                                            >
                                                {t('checkout.remove')}
                                            </button>
                                        )}
                                    </div>

                                    {/* Discount Details */}
                                    <div className={`text-lg font-bold ${promo.auto_apply ? 'text-purple-600' : 'text-green-600'}`}>
                                        {promo.amount_off && promo.amount_off > 0 ? (
                                            <span>-{t("{{price, currency}}", { price: promo.amount_off })}</span>
                                        ) : promo.percentage_off && promo.percentage_off > 0 ? (
                                            <span>{promo.percentage_off}% {t('off') || 'خصم'}</span>
                                        ) : promo.free_shipping ? (
                                            <span>{t('checkout.freeShipping') || 'شحن مجاني'}</span>
                                        ) : null}
                                    </div>

                                    {/* Saved Amount */}
                                    {promo.discount > 0 && (
                                        <p className={`text-xs mt-1 ${promo.auto_apply ? 'text-purple-600' : 'text-green-600'}`}>
                                            {t('youSaved') || 'وفرت'}: {t("{{price, currency}}", { price: promo.discount })}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Potential Discounts Banner */}
                    {potentialPromos.length > 0 && (
                        <div className="space-y-2">
                            {potentialPromos.slice(0, 2).map((promo) => {
                                const remaining = promo.min_order_amount - cart.netTotal;
                                const discountText = promo.amount_off
                                    ? t("{{price, currency}}", { price: promo.amount_off })
                                    : promo.percentage_off
                                        ? `${promo.percentage_off}%`
                                        : promo.free_shipping
                                            ? (t('checkout.freeShipping') || 'شحن مجاني')
                                            : '';

                                return (
                                    <div key={promo.id} className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                                        <div className="flex items-start gap-2">
                                            <Gift className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-amber-800">
                                                    {t('addMoreToUnlock', {
                                                        amount: t("{{price, currency}}", { price: remaining }),
                                                        discount: discountText
                                                    }) || `أضف ${t("{{price, currency}}", { price: remaining })} للحصول على خصم ${discountText}`}
                                                </p>
                                                <div className="mt-2 bg-amber-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-amber-500 h-full rounded-full transition-all duration-300"
                                                        style={{ width: `${Math.min(100, (cart.netTotal / promo.min_order_amount) * 100)}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-amber-600 mt-1">
                                                    {t("{{price, currency}}", { price: cart.netTotal })} / {t("{{price, currency}}", { price: promo.min_order_amount })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Add Promo Code Input */}
                    <div className="relative">
                        <input
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            type="text"
                            placeholder={t("checkout.promoCodePlaceholder")}
                            className="w-full px-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                        <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <button
                            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-white text-primary-600 text-xs font-semibold rounded-lg border border-gray-100 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            onClick={() => {
                                applyPromoCode(promoCode, customerId);
                                setPromoCode(''); // Clear input after applying
                            }}
                            disabled={promoCode.trim().length === 0}
                        >
                            {t("checkout.applyButton")}
                        </button>
                    </div>
                </div>

                {/* Totals */}
                {(() => {
                    // Original subtotal (sum of original prices before bundle discounts)
                    const originalSubtotal = cart.items.reduce((sum, item) => {
                        const origPrice = item.original_price && item.original_price > item.price ? item.original_price : item.price;
                        return sum + (origPrice * item.quantity);
                    }, 0);

                    // Final subtotal after bundle prices
                    const itemsSubtotal = cart.items.reduce((sum, item) => {
                        return sum + (item.price * item.quantity);
                    }, 0);

                    const totalBundleDiscount = Math.max(0, originalSubtotal - itemsSubtotal);

                    // Calculate promo code discount sequentially
                    let remainingForPromo = itemsSubtotal;
                    let promoDiscountTotal = 0;

                    if (cart.promoCodes && cart.promoCodes.length > 0) {
                        cart.promoCodes.forEach(p => {
                            if (p.amount_off && p.amount_off > 0) {
                                const amt = Math.min(p.amount_off, remainingForPromo);
                                promoDiscountTotal += amt;
                                remainingForPromo -= amt;
                            }
                        });
                        cart.promoCodes.forEach(p => {
                            if (p.percentage_off && p.percentage_off > 0) {
                                const pct = remainingForPromo * (p.percentage_off / 100);
                                promoDiscountTotal += pct;
                                remainingForPromo -= pct;
                            }
                        });
                    }

                    const shippingFees = cart.free_shipping || cart.isAdmin ? 0 : (selectedGovernorate?.fees ?? 0);
                    const finalTotal = cart.isAdmin ? 0 : Math.max(0, itemsSubtotal - promoDiscountTotal + shippingFees);

                    return (
                        <div className="space-y-3 mt-6 pt-6 border-t border-gray-100">
                            {/* Subtotal */}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('checkout.subtotal')}</span>
                                <span className="font-medium text-gray-900">
                                    {t("{{price, currency}}", { price: cart.isAdmin ? 0 : originalSubtotal })}
                                </span>
                            </div>

                            {/* Bundle Discount Row */}
                            {totalBundleDiscount > 0 && !cart.isAdmin && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                                        🎁 {t('bundleDiscount') || 'خصم الباقة'}
                                    </span>
                                    <span className="font-semibold text-emerald-700">
                                        -{t("{{price, currency}}", { price: totalBundleDiscount })}
                                    </span>
                                </div>
                            )}

                            {/* Promo Code Discount Row */}
                            {promoDiscountTotal > 0 && !cart.isAdmin && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-purple-700 font-medium flex items-center gap-1.5">
                                        🏷️ {t('checkout.discount')}
                                    </span>
                                    <span className="font-semibold text-purple-700">
                                        -{t("{{price, currency}}", { price: promoDiscountTotal })}
                                    </span>
                                </div>
                            )}

                            {/* Shipping */}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('checkout.shipping')}</span>
                                <span className="font-medium text-gray-900">
                                    {selectedGovernorate ?
                                        t("{{price, currency}}", { price: shippingFees }) :
                                        <span className="text-orange-500 text-xs bg-orange-50 px-2 py-1 rounded-full">{t('checkout.selectLocation')}</span>}
                                </span>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                                <span className="text-base font-bold text-gray-900">{t('checkout.total')}</span>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-primary-600 block leading-none">
                                        {t("{{price, currency}}", { price: finalTotal })}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-normal">{t('checkout.includingVat')}</span>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Pay Button */}
                <button
                    onClick={onPurchase}
                    disabled={!selectedGovernorate || products.length === 0}
                    className="w-full mt-6 py-3.5 rounded-xl bg-primary-600 text-white font-semibold shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:shadow-primary-600/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {t("checkout.payNowButton")}
                </button>
            </div>
        </section>
    );
}