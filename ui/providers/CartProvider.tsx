"use client";
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState, } from "react";
import { toast } from "sonner";
import lz from 'lz-string';
import { ProductView } from "@/domain/entities/views/shop/productView";
import { useTranslation } from "react-i18next";

// Note: Ensure 'js-cookie' is installed
const Cookies = require("js-cookie");


const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

export function CartProvider({ children }: Readonly<{ children: ReactNode }>) {
    // Initializing totals to 0 and items as empty array
    const emptyCart: Cart = { discount: 0, netTotal: 0, total: 0, items: [], promoCode: null };
    const [cart, setCart] = useState<Cart>(emptyCart);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const { t } = useTranslation();

    // --- Effects (Data Loading and Saving) ---

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== "undefined") {
            const savedCart = localStorage.getItem("cart");
            if (savedCart) {
                try {
                    const decompressedCart = lz.decompressFromUTF16(savedCart);
                    const parsedCart = JSON.parse(decompressedCart || JSON.stringify(emptyCart));
                    // Ensure the cart structure is complete upon loading
                    setCart({ ...emptyCart, ...parsedCart });
                } catch (err) {
                    console.error("Error loading cart:", err);
                    setCart(emptyCart);
                }
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!loading && isClient && typeof window !== "undefined") {
            const compressedCart = lz.compressToUTF16(JSON.stringify(cart));
            localStorage.setItem("cart", compressedCart);
            Cookies.set("cart", "1", { expires: 1 });
        }
    }, [cart, loading, isClient]);

    // --- Cart Actions (Simplified Logic) ---

    const addToCart = async (product: ProductView, quantity: number) => {
        setCart(prevCart => {
            const existingItemIndex = prevCart.items.findIndex(
                (item) => item.slug === product.slug
            );

            let newItems: { slug: string, quantity: number }[];

            if (existingItemIndex >= 0) {
                // Item exists: update quantity
                newItems = prevCart.items.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                // Item is new: add to cart
                newItems = [...prevCart.items, { slug: product.slug, quantity: quantity }];
            }

            // ONLY update items; totals (discount, total, netTotal) are left untouched
            return { ...prevCart, items: newItems };
        });

        toast.success(t('addedtoCart', { product: product.name }), { duration: 2000 });
    };

    const removeFromCart = async (product: ProductView) => {
        setCart(prevCart => {
            // Filter out the product based on slug
            const newItems = prevCart.items.filter(
                (item) => item.slug !== product.slug
            );

            // ONLY update items
            return { ...prevCart, items: newItems };
        });
    };

    const updateQuantity = async (product: ProductView, quantity: number) => {
        if (quantity <= 0) {
            await removeFromCart(product);
            return;
        }

        setCart(prevCart => {
            const newItems = prevCart.items.map((item) =>
                item.slug === product.slug ? { ...item, quantity } : item
            );

            // ONLY update items
            return { ...prevCart, items: newItems };
        });
    };

    const clearCart = async () => {
        // Resetting to emptyCart ensures items are cleared and all totals are reset to 0
        setCart(emptyCart);
    };

    // --- Promo Code Actions (New Simple Logic) ---

    const applyPromoCode = async (code: string) => {
        // ONLY update promoCode field
        setCart(prevCart => ({
            ...prevCart,
            promoCode: code,
            // NOTE: Total, netTotal, and discount would ideally be updated here by a server response.
            // Since we're not calculating, we just update the code.
        }));
        toast.info(t('promoApplied', { code }), { duration: 2000 });
    };

    const removePromoCode = async () => {
        // ONLY reset promoCode field
        setCart(prevCart => ({
            ...prevCart,
            promoCode: null,
            // NOTE: Total, netTotal, and discount would ideally be updated here by a server response.
        }));
    };

    // --- Getter Functions ---

    const getCartCount = () => {
        // Calculate item count based on the current items array
        return cart.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    };

    const getCartTotal = (shipping: number) => {
        // Use the existing `total` field from state, which is assumed to be updated externally.
        return (cart.total || 0) + (shipping || 0);
    };

    // --- Memoized Context Value ---

    const value = useMemo(
        () => ({
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            applyPromoCode,
            removePromoCode,
            getCartTotal,
            getCartCount,
            loading,
        }),
        [cart, loading]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}