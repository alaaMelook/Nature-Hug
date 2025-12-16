"use client";
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState, } from "react";
import { toast } from "sonner";
import lz from 'lz-string';
import { ProductView, CartItem } from "@/domain/entities/views/shop/productView";
import { useTranslation } from "react-i18next";
import { validatePromoCodeAction } from "@/ui/hooks/store/usePromoCodeActions";
import { validateCart } from "../hooks/store/validateCart";

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
    const emptyCart: Cart = { discount: 0, netTotal: 0, total: 0, items: [], promoCode: null, promoCodeId: null, free_shipping: false, isAdmin: false };
    const [cart, setCart] = useState<Cart>(emptyCart);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const { t, i18n } = useTranslation();
    const itemsKey = useMemo(
        () => JSON.stringify(cart.items.map(i => ({ s: i.slug, q: i.quantity }))),
        [cart.items]
    )

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

    // --- Promo Code Re-validation ---
    useEffect(() => {
        const revalidate = async () => {
            if (cart.promoCode && cart.items.length > 0) {
                const result = await validatePromoCodeAction(cart.promoCode, cart.items);
                if (result.isValid && 'discount' in result) {
                    setCart(prev => ({
                        ...prev,
                        discount: result.discount,
                        promoCodeId: result.details?.id ?? null
                    }));
                } else {
                    setCart(prev => ({ ...prev, discount: 0, promoCodeId: null }));
                }
            } else if (cart.items.length === 0 && cart.discount > 0) {
                setCart(prev => ({ ...prev, discount: 0, promoCodeId: null }));
            }
        };

        const timeout = setTimeout(revalidate, 500);
        return () => clearTimeout(timeout);
    }, [cart.items, cart.promoCode]);

    // --- Cart Actions (Simplified Logic) ---
    // --- Cart Synchronization ---
    // Exposed function to force sync (e.g. when language changes or user visits cart)
    const syncCart = async () => {
        if (loading || cart.items.length === 0) return;

        try {
            const res = await validateCart(cart.items.map(i => ({ slug: i.slug, quantity: i.quantity })), i18n.language as LangKey);

            setCart(prev => ({
                ...prev,
                // Recalculate discount based on VALIDATED items
                discount: (prev.promoCode ? prev.discount : 0) + res.items.reduce((acc, item) => acc + (item.discount ?? 0) * item.quantity, 0),
                items: res.items,
                total: res.items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                netTotal: res.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) - (prev.discount || 0),
            }));

            // Handle removed items
            if (res.removed.length > 0) {
                res.removed.forEach(item => {
                    if (item.reason === 'OUT_OF_STOCK') {
                        toast.error(t('stockLimitExceededRemove', { product: item.slug })); // ideally use name if available
                    } else if (item.reason === 'NOT_FOUND') {
                        // Silent remove or invalid
                    }
                });
            }
        } catch (error) {
            console.error("Failed to sync cart:", error);
        }
    };

    // Initial sync on mount/load
    useEffect(() => {
        if (!loading && cart.items.length > 0) {
            syncCart();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, i18n.language]); // Run once when loading finishes or local changes


    const addToCart = async (product: ProductView, quantity: number) => {
        setCart(prevCart => {
            const existingItem = prevCart.items.find(
                (item) => item.slug === product.slug
            );

            const currentQty = existingItem ? existingItem.quantity : 0;
            const newQty = currentQty + quantity;

            if (newQty > product.stock) {
                toast.error(t('stockLimitExceeded', { product: product.name, stock: product.stock }));
                return prevCart;
            }

            let newItems: CartItem[];

            if (existingItem) {
                // Item exists: update quantity
                newItems = prevCart.items.map((item) =>
                    item.slug === product.slug ? { ...item, quantity: newQty } : item
                );
            } else {
                // Item is new: add to cart
                // We convert ProductView to CartItem (assuming they are compatible or we explicitly map)
                // If ProductView doesn't match CartItem exactly, we might need to cast or map.
                // Assuming CartItem extends ProductView or has same fields.
                newItems = [...prevCart.items, { ...product, quantity: quantity }];
            }

            toast.success(t('addedtoCart', { product: product.name }), { duration: 2000 });
            // ONLY update items; totals (discount, total, netTotal) are left untouched
            return { ...prevCart, items: newItems, netTotal: prevCart.netTotal + (product.price || 0) * quantity };
        });
    };

    const removeFromCart = async (product: ProductView) => {
        setCart(prevCart => {
            // Filter out the product based on slug
            const newItems = prevCart.items.filter(
                (item) => item.slug !== product.slug
            );

            // ONLY update items
            return { ...prevCart, items: newItems, netTotal: prevCart.netTotal - (product.price || 0) * (prevCart.items.find(item => item.slug === product.slug)?.quantity || 0) };
        });
    };

    const updateQuantity = async (product: ProductView, quantity: number) => {
        if (quantity <= 0) {
            await removeFromCart(product);
            return;
        }

        if (quantity > product.stock) {
            toast.error(t('stockLimitExceeded', { product: product.name, stock: product.stock }));
            return;
        }

        setCart(prevCart => {
            const newItems = prevCart.items.map((item) =>
                item.slug === product.slug ? { ...item, quantity } : item
            );

            // ONLY update items
            return { ...prevCart, items: newItems, netTotal: prevCart.netTotal + (product.price || 0) * (quantity - (prevCart.items.find(item => item.slug === product.slug)?.quantity || 0)) };
        });
    };

    const clearCart = async () => {
        // Resetting to emptyCart ensures items are cleared and all totals are reset to 0
        setCart(emptyCart);
    };

    // --- Promo Code Actions (New Simple Logic) ---

    const applyPromoCode = async (code: string) => {
        const result = await validatePromoCodeAction(code, cart.items);
        if (result.isValid && 'isAdmin' in result && result.isAdmin) {
            setCart(prevCart => ({
                ...prevCart,
                promoCode: code,
                free_shipping: false,
                discount: 0,
                promoCodeId: result.details?.id ?? null,
                isAdmin: result.isAdmin,
            }));
        }
        else if (result.isValid && 'discount' in result) {
            setCart(prevCart => ({
                ...prevCart,
                promoCode: code,
                free_shipping: result.details?.free_shipping ?? false,
                promoCodeId: result.details?.id ?? null,
                discount: result.discount,
            }));
            console.log('[ADMIN ORDER]', cart.discount, cart.netTotal, cart.free_shipping);
            if (cart.isAdmin) {
                toast.info(t('checkout.adminOrder'));
            }
            else {
                toast.success(t('promoApplied', { code }), { duration: 2000 });
            }
        } else {
            toast.error(result.error || t('invalidPromoCode'));
        }
    };

    const removePromoCode = async () => {
        setCart(prevCart => ({
            ...prevCart,
            promoCode: null,
            promoCodeId: null,
            free_shipping: false,
            discount: 0,
            isAdmin: false
        }));
    };

    // --- Getter Functions ---

    const getCartCount = () => {
        // Calculate item count based on the current items array
        return cart.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    };

    const getCartTotal = (shipping: number) => {
        // Use the existing `total` field from state, which is assumed to be updated externally.
        return (cart.netTotal || 0) + (shipping || 0) - (cart.isAdmin ? 0 : cart.discount || 0);
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
            itemsKey,
            loading,
            setCart,
            syncCart
        }),
        [cart, loading]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}