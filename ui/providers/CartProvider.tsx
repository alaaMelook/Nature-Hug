"use client";
import React, {createContext, ReactNode, useContext, useEffect, useMemo, useState,} from "react";
import {toast} from "sonner";
import lz from 'lz-string';
import {CartItem, ProductView} from "@/domain/entities/views/shop/productView";


const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

export function CartProvider({children}: Readonly<{ children: ReactNode }>) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const Cookies = require("js-cookie");

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== "undefined") {
            const savedCart = localStorage.getItem("cart");
            if (savedCart) {
                try {
                    const decompressedCart = lz.decompressFromUTF16(savedCart);
                    setCart(JSON.parse(decompressedCart || "[]"));
                } catch (err) {
                    console.error("Error loading cart:", err);
                    setCart([]);
                }
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!loading && isClient && typeof window !== "undefined") {
            const compressedCart = lz.compressToUTF16(JSON.stringify(cart));
            localStorage.setItem("cart", compressedCart);
            Cookies.set("cart", "1", {expires: 1}); // just a flag for SSR hydration
        }
    }, [cart, loading, isClient]);

    const addToCart = async (product: ProductView, quantity: number) => {
        const existingItemIndex = cart.findIndex(
            (item) => item.slug === product.slug  // Use ID instead of name_english
        );

        const newCart = existingItemIndex >= 0
            ? cart.map((item, index) =>
                index === existingItemIndex
                    ? {...item, quantity: item.quantity + 1}
                    : item
            )
            : [...cart, {...product, quantity: quantity}];

        toast.success(`${product.name} added to cart`, {duration: 2000});
        setCart(newCart);
    };
    const totalDiscount = cart.reduce((acc, item) => acc + ((item.discount || 0) * item.quantity), 0);
    const removeFromCart = async (product: ProductView) => {
        const newCart = cart.filter(
            (item) => {
                return item.slug !== product.slug
            }  // Use ID instead of name_english
        );
        setCart(newCart);
    };

    const updateQuantity = async (product: ProductView, quantity: number) => {
        if (quantity <= 0) {
            await removeFromCart(product);
            return;
        }

        const newCart = cart.map((item) =>
            item.slug === product.slug ? {...item, quantity} : item
        );
        setCart(newCart);
    };

    const clearCart = async () => {
        setCart([]);
    };

    const getCartNetTotal = () => {
        return cart.reduce(
            (acc, item) => acc + (item.quantity * (item.price - (item.discount || 0) || 0)),
            0
        );
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getCartCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const value = useMemo(
        () => ({
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalDiscount,
            getCartTotal,
            getCartCount,
            getCartNetTotal,
            loading,
        }),
        [cart, loading]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
