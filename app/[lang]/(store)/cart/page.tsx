"use client";
import { ArrowRightIcon, Handbag, Trash2Icon, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useCart } from "@/ui/providers/CartProvider";
import { Tooltip } from "flowbite-react";
import Counter from "@/ui/components/store/Counter";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CartPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { cart, removeFromCart, clearCart, updateQuantity } = useCart();

    const products = cart.items;



    // --- RENDER LOGIC ---


    // Loading state is now handled by CartProvider's global loading if needed,
    // or we can skip it since cart is loaded from local storage quickly.
    // If we want to show loading during initial sync, we can use useCart().loading
    // But usually rendering the cart immediately is fine.

    if (cart.items.length === 0) {
        return (
            <div
                className="flex flex-col items-center justify-center min-h-screen bg-white p-8 text-center transition-colors duration-300 ">
                <Handbag className="h-20 w-20 text-primary-200 mb-6" />
                <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
                    {t("emptyCart")}
                </h1>
                <p className="text-lg text-slate-600 mb-8 max-w-sm">
                    {t("startAdding")}
                </p>
                <button
                    className="flex items-center space-x-2 px-8 py-4 hover:bg-primary-50 hover:text-primary-700 transition-colors cursor-pointer bg-primary-800 text-primary-50 font-semibold rounded-full shadow-lg duration-300"
                    onClick={() => {
                        router.push("/products");
                    }}
                >
                    <ArrowRightIcon className="h-5 w-5" />
                    <span>{t("shopNow")}</span>
                </button>
            </div>
        );
    }
    return (
        <div className="bg-gray-100 min-h-screen py-16 antialiased text-slate-900 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-3 lg:gap-12">
                    {/* Cart Items Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {products.map((item) => (
                            <div
                                // key now uses the item.slug, which is unique and available
                                key={item.slug}
                                className="bg-white rounded-3xl shadow-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between transform transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl border border-slate-100 "
                            >
                                <div className="flex items-center gap-6 w-full">
                                    <div
                                        className="flex-shrink-0 relative w-24 h-24 rounded-2xl overflow-hidden shadow-inner">
                                        <Image
                                            src={
                                                item.image ||
                                                "https://placehold.co/100x100/E2E8F0/FFF?text=No+Image"
                                            }
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            fill={true}
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="text-lg text-primary-950 font-semibold mb-5">
                                            {item.name}
                                        </h3>

                                        <Counter
                                            quantity={item.quantity} // Use item.quantity (no need for ?? 0 since it's a CartItem)
                                            onIncrease={() => {
                                                // Pass the CartItem object for update
                                                updateQuantity(item, item.quantity + 1);
                                            }}
                                            onDecrease={() => {
                                                const newQty = item.quantity - 1;
                                                // Pass the CartItem object for update
                                                updateQuantity(item, newQty);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 mt-4 sm:mt-0 sm:ml-auto">
                                    {item.discount ? (
                                        <div className="flex flex-col items-end gap-2">
                                            <p className="text-sm text-natural-500 line-through text-normal">
                                                {t("{{price, currency}}", { price: item.price })}
                                            </p>
                                            <p className="text-xl text-primary-900 w-28 text-right text-semibold">
                                                {t("{{price, currency}}", { price: item.quantity * ((item.price || 0) - item.discount) })}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xl text-primary-900 w-28 text-right text-semibold">
                                            {t("{{price, currency}}", { price: item.quantity * (item.price || 0) })}
                                        </p>
                                    )}
                                    <Tooltip
                                        content="Remove"
                                        animation="duration-500"
                                        placement={`bottom`}
                                    >
                                        <button
                                            onClick={() => removeFromCart(item)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors duration-300"
                                            aria-label={t("remove")}
                                        >
                                            <X className="h-6 w-6 cursor-pointer" />
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary Section */}
                    <div className="mt-12 lg:mt-0 lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-xl p-8 lg:sticky lg:top-8 border border-slate-100 ">
                            <h2 className="text-2xl font-bold mb-6 border-b border-slate-200 pb-4">
                                {t("subtotal")}
                            </h2>
                            <div className="flex justify-between items-center text-slate-700 mb-4">
                                <span className="text-lg">{t("subtotal")}</span>
                                <span className="text-lg font-semibold text-slate-900">
                                    {t("{{price, currency}}", { price: cart.netTotal })}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mb-6 flex">{t("checkoutInfo")}</p>


                            <button
                                className=" w-full cursor-pointer py-4 bg-primary-800 text-primary-50 font-bold rounded-full text-lg shadow-lg hover:bg-primary-50 hover:text-primary-700 transition-colors duration-300"
                                onClick={() => {
                                    router.push("/checkout");
                                }}
                            >

                                {t("proceedToCheckout")}
                            </button>


                        </div>
                    </div>
                    <button
                        className=" w-15 h-15 cursor-pointer m-5 bg-gray-400 text-primary-50 rounded-full text-lg shadow-lg"
                        onClick={() => clearCart()}
                    >
                        <center>
                            <Trash2Icon></Trash2Icon>

                        </center>
                    </button>
                </div>
            </div>
        </div>
    );
}