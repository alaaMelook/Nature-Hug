"use client";
import { useCart } from "@/ui/providers/CartProvider";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Governorate } from "@/domain/entities/database/governorate";
import { useCartProducts } from "@/ui/hooks/store/useCartProducts";
import Image from "next/image";

export function CheckoutCart({ selectedGovernorate, onPurchase }: {
    selectedGovernorate: Governorate | null,
    onPurchase: () => void,
}) {
    const { t } = useTranslation();
    const { cart, getCartTotal, applyPromoCode, removePromoCode } = useCart()
    const [promoCode, setPromoCode] = useState<string>('');
    const { data: products = [], isLoading: loadingProducts } = useCartProducts();

    useEffect(() => {

    }, [applyPromoCode]);
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
                    {!loadingProducts && products.length === 0 ? (
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

                {/* Promo Code */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                    {cart.promoCode ? (
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700">{cart.promoCode.toUpperCase()}</span>
                            </div>
                            <button
                                onClick={() => removePromoCode()}
                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                                {t('checkout.remove')}
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <input
                                onChange={(e) => setPromoCode(e.target.value)}
                                type="text"
                                placeholder={t("checkout.promoCodePlaceholder")}
                                className="w-full px-20 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            />
                            <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <button
                                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-white text-primary-600 text-xs font-semibold rounded-lg border border-gray-100 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                onClick={() => applyPromoCode(promoCode)}
                                disabled={promoCode.trim().length === 0}
                            >
                                {t("checkout.applyButton")}
                            </button>
                        </div>
                    )}
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

                    {cart.discount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">{t('checkout.discount')}</span>
                            <span className="font-medium text-green-600">
                                -{t("{{price, currency}}", { price: cart.isAdmin ? cart.netTotal : Math.abs(cart.discount) })}
                            </span>
                        </div>
                    )}

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