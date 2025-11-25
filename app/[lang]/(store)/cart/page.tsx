"use client";
import { ArrowRightIcon, Handbag, Trash2Icon, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/ui/providers/CartProvider";
import { Tooltip } from "flowbite-react";
import Counter from "@/ui/components/store/Counter";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Import CartItem and ProductView types
import { CartItem } from "@/domain/entities/views/shop/productView";
import { GetProductsData } from "@/ui/hooks/store/useProductsData";
// Removed import { Router } from "next/router";
export default function CartPage() {
    const pathname = usePathname();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
    const [holder, setHolder] = useState(cart.items);

    const [products, setProducts] = useState<CartItem[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);



    // --- DATA FETCHING AND SYNC LOGIC --- 


    // 1. loadProducts: Fetches product details based on cart items.
    const loadProducts = useCallback(async () => {


        if (holder.length === 0) {
            setProducts([]);
            setLoadingProducts(false);
            return;
        }

        setLoadingProducts(true);
        const productSlugsInCart = holder.map(item => item.slug);
        const productsData: CartItem[] = []; // Prepare to hold complete CartItem objects

        for (const slug of productSlugsInCart) {
            // Assume GetProductsData is defined as LangKey
            const prodView = await new GetProductsData(i18n.language as LangKey).bySlug(slug);
            const cartItemData = holder.find(ci => ci.slug === slug);

            if (prodView && cartItemData) {
                // 💡 MAPPING: Combine fetched ProductView with the current quantity
                const completeCartItem: CartItem = {
                    ...prodView,
                    quantity: cartItemData.quantity
                };
                productsData.push(completeCartItem);
            }
        }

        setProducts(productsData);
        setLoadingProducts(false);
        // Dependency only on language. Removed Router.events.
    }, [i18n.language]);

    useEffect(() => {
        if (holder.length > 0) {
            loadProducts();
        }
    }, [loadProducts, cart.items.length]);


    // 3. useEffect (Quantity Sync): Runs on *every* cart change (including quantity).
    useEffect(() => {
        if (!loadingProducts) {
            setProducts(prevProducts => {
                const cartQuantities = new Map(cart.items.map(item => [item.slug, item.quantity]));

                return prevProducts
                    .map(p => {
                        const newQuantity = cartQuantities.get(p.slug);
                        // If the item exists in the cart, update its quantity.
                        return newQuantity !== undefined ? { ...p, quantity: newQuantity } : p;
                    })
                    // Filter out any products that no longer exist in the cart.
                    .filter(p => cartQuantities.has(p.slug));
            });
        }
    }, [cart.items, loadingProducts]); // Runs whenever the cart structure OR quantities change.

    // --- RENDER LOGIC ---

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
    if (loadingProducts) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 text-center transition-colors duration-300 ">
                <Handbag className="h-20 w-20 text-primary-200 mb-6 animate-spin-slow" />
                <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
                    {t("loadingCart")}
                </h1>
                <p className="text-lg text-slate-600 mb-8 max-w-sm">
                    {t("pleaseWait")}
                </p>
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
                                        <img
                                            src={
                                                item.image ||
                                                "https://placehold.co/100x100/E2E8F0/FFF?text=No+Image"
                                            }
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="text-lg text-primary-950 font-semibold mb-5">
                                            {item.name}
                                        </h3>

                                        <Counter
                                            quantity={item.quantity} // Use item.quantity (no need for ?? 0 since it's a CartItem)
                                            onIncrease={() => {
                                                // Optimistically update local products list for instant UI feedback
                                                setProducts(prev => prev.map(p => p.slug === item.slug ? { ...p, quantity: p.quantity + 1 } : p));
                                                // Pass the CartItem object for update
                                                updateQuantity(item, item.quantity + 1);
                                            }}
                                            onDecrease={() => {
                                                const newQty = item.quantity - 1;
                                                // Optimistically update or remove locally to keep UI seamless
                                                setProducts(prev => {
                                                    if (newQty <= 0) {
                                                        return prev.filter(p => p.slug !== item.slug);
                                                    }
                                                    return prev.map(p => p.slug === item.slug ? { ...p, quantity: newQty } : p);
                                                });
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