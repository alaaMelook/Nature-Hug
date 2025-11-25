"use client";
import Image from "next/image";
import { useCart } from "@/ui/providers/CartProvider";
import { useState } from "react";
// Assuming Governorate type is defined outside this component
// import { Governorate } from "@/domain/entities/database/governorate"; 
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
// Assuming CartItem is defined or imported correctly
import { CartItem } from "@/domain/entities/views/shop/productView";
import { useTranslation } from "react-i18next";
import { Governorate } from "@/domain/entities/database/governorate";


export function CheckoutCart({ selectedGovernorate, onDiscountApplied, onPurchase, items }: {
    selectedGovernorate: Governorate | null,
    onDiscountApplied?: (code: string) => void,
    onPurchase: () => void,
    // Using CartItem[] ensures we have all required properties like 'quantity'
    items: Partial<CartItem>[]
}) {
    const { t } = useTranslation();
    const { cart, getCartTotal } = useCart()
    const [promoCode, setPromoCode] = useState<string>('');



    return (
        // Adjusted padding and removed fixed h-screen
        <section className="w-full md:w-1/3 p-4 md:p-8 flex flex-col space-y-8 bg-gray-50 rounded-2xl shadow-xl">

            {/* Back to Cart Link */}
            <Link href={'/cart'}
                className="flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-800 transition duration-150">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Cart</span>
            </Link>

            <h2 className="text-xl font-bold text-gray-800 border-b pb-4">Order Summary</h2>

            {/* Cart Items List - Max height for scrolling */}
            {/* Using a custom max-height class for a more controlled scroll area */}
            <div className="space-y-5 auto-scroll max-h-[40vh] overflow-y-auto pr-3">
                {items.length === 0 ? (
                    <p className="text-gray-500 italic text-center">Your cart is empty.</p>
                ) : (
                    items.map((item) => (
                        // Use item.slug as the key if it exists, otherwise fallback to item.id
                        <div key={item.slug || item.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">

                                {/* Image Display with Fallback */}
                                <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">

                                    <img
                                        className="w-full h-full object-cover"
                                        src={
                                            item.image ||
                                            "https://placehold.co/100x100/E2E8F0/FFF?text=No+Image"
                                        }
                                        alt={item.name}
                                        width={64} height={64}


                                    />

                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                                    {/* BUG FIX: Displaying the actual item quantity */}
                                    <p className="text-xs text-gray-500">{item.quantity}x</p>
                                </div>
                            </div>

                            {/* Item Price */}
                            <div className="text-right">
                                {item.discount && item.discount > 0 ? (
                                    <>
                                        <p className="text-xs text-gray-500 line-through">
                                            {t("{{price, currency}}", { price: (item.price ?? 0) * (item.quantity ?? 1) })}
                                        </p>
                                        <p className="text-sm font-semibold text-primary-700">
                                            {t("{{price, currency}}", { price: ((item.price ?? 0) - (item.discount ?? 0)) * (item.quantity ?? 1) })}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm font-semibold text-gray-700">
                                        {t("{{price, currency}}", { price: (item.price ?? 0) * (item.quantity ?? 1) })}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Promo Code Input */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm mt-4">
                <input
                    onChange={(e) => setPromoCode(e.target.value)}
                    type="text"
                    placeholder={t("promoCodePlaceholder") || "Promo Code"}
                    className="flex-1 px-4 py-3 outline-none text-sm text-gray-700 placeholder-gray-400 bg-white"
                />
                <button
                    className="px-4 py-3 bg-gray-100 text-primary-600 font-medium hover:bg-primary-50 transition duration-150 disabled:opacity-50"
                    onClick={() => {
                        onDiscountApplied?.(promoCode)
                    }}
                    disabled={promoCode.trim().length === 0}
                >
                    {t("applyButton") || "Apply"}
                </button>
            </div>

            {/* Totals Summary */}
            <div className="space-y-3 text-sm pt-4 border-t border-gray-200">

                {/* Subtotal */}
                <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-800">
                        {t("{{price, currency}}", { price: cart.netTotal })}
                    </span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-800">
                        {selectedGovernorate ?
                            t("{{price, currency}}", { price: selectedGovernorate.fees }) :
                            <span className="text-yellow-600">Select Location</span>}
                    </span>
                </div>

                {/* Discount */}
                <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span
                        className={`font-bold ${cart.discount > 0 ? "text-red-500" : 'text-gray-800'}`}>
                        {/* Improved discount currency formatting */}
                        {t("{{price, currency}}", { price: -Math.abs(cart.discount) })}
                    </span>
                </div>

                {/* Total */}
                <div className="border-t border-gray-300 pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{t("{{price, currency}}", { price: getCartTotal(selectedGovernorate?.fees ?? 0) })}</span>
                </div>
            </div>

            {/* Pay Button */}
            <button
                onClick={onPurchase}
                // Disabled if no governorate is selected
                disabled={!selectedGovernorate || items.length === 0}
                className="w-full py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-lg hover:bg-primary-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
                {t("payNowButton") || "Pay Now"}
            </button>

        </section>
    );
}