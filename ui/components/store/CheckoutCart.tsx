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
                        products.map((item) => (
                            <div key={item.slug} className="flex gap-4 py-2">
                                {/* Image */}
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
                                        {item.discount && item.discount > 0 ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-primary-600">
                                                    {t("{{price, currency}}", { price: ((item.price ?? 0) - (item.discount ?? 0)) * (item.quantity ?? 1) })}
                                                </span>
                                                <span className="text-xs text-gray-400 line-through">
                                                    {t("{{price, currency}}", { price: (item.price ?? 0) * (item.quantity ?? 1) })}
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
                        ))
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
                <div className="space-y-3 mt-6 pt-6 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t('checkout.subtotal')}</span>
                        <span className="font-medium text-gray-900">
                            {t("{{price, currency}}", { price: cart.isAdmin ? 0 : cart.netTotal })}
                        </span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t('checkout.shipping')}</span>
                        <span className="font-medium text-gray-900">
                            {selectedGovernorate ?
                                t("{{price, currency}}", { price: cart.free_shipping || cart.isAdmin ? 0 : selectedGovernorate.fees }) :
                                <span className="text-orange-500 text-xs bg-orange-50 px-2 py-1 rounded-full">{t('checkout.selectLocation')}</span>}
                        </span>
                    </div>

                    {/* Discount Row - calculated sequentially from promoCodes */}
                    {cart.promoCodes && cart.promoCodes.length > 0 && (() => {
                        // Sequential discount calculation for display
                        let remainingAmount = cart.netTotal || 0;
                        let totalDiscount = 0;

                        // First: fixed amount discounts
                        cart.promoCodes.forEach(p => {
                            if (p.amount_off && p.amount_off > 0) {
                                const amountToDiscount = Math.min(p.amount_off, remainingAmount);
                                totalDiscount += amountToDiscount;
                                remainingAmount -= amountToDiscount;
                            }
                        });

                        // Then: percentage discounts on remaining
                        cart.promoCodes.forEach(p => {
                            if (p.percentage_off && p.percentage_off > 0) {
                                const percentageDiscount = remainingAmount * (p.percentage_off / 100);
                                totalDiscount += percentageDiscount;
                                remainingAmount -= percentageDiscount;
                            }
                        });

                        return totalDiscount > 0 ? (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('checkout.discount')}</span>
                                <span className="font-medium text-green-600">
                                    -{t("{{price, currency}}", { price: totalDiscount })}
                                </span>
                            </div>
                        ) : null;
                    })()}

                    <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                        <span className="text-base font-bold text-gray-900">{t('checkout.total')}</span>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-primary-600 block leading-none">
                                {t("{{price, currency}}", { price: cart.isAdmin ? 0 : getCartTotal(cart.free_shipping ? 0 : selectedGovernorate?.fees ?? 0) })}
                            </span>
                            <span className="text-[10px] text-gray-400 font-normal">{t('checkout.includingVat')}</span>
                        </div>
                    </div>
                </div>

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