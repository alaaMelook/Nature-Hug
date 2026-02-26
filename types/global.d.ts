import { CartItem } from "@/domain/entities/views/shop/productView";
import React from "react";

export { };

declare global {


    interface ApiResponse<T = any> {
        data?: T;
        error?: string;
        success: boolean;
    }
    interface AppliedPromoCode {
        id: number;
        code: string;
        discount: number;
        free_shipping: boolean;
        is_bogo?: boolean;
        percentage_off?: number;
        amount_off?: number;  // Fixed amount discount in EGP
        auto_apply?: boolean; // Whether this was auto-applied
    }
    interface Cart {
        promoCode: string | null;  // Keep for backward compatibility
        promoCodeId: number | null;  // Keep for backward compatibility
        promoCodes: AppliedPromoCode[];  // New: array of applied promo codes
        discount: number;  // Total discount from all promo codes
        free_shipping: boolean;
        total: number;
        netTotal: number;
        items: CartItem[];
        isAdmin: boolean;

    }
    interface CartContextType {
        cart: Cart;
        addToCart: (product: Product, quantity: number) => Promise<void>;
        removeFromCart: (product: Product) => Promise<void>;
        updateQuantity: (product: Product, quantity: number) => Promise<void>;
        clearCart: () => Promise<void>;
        getCartTotal: (shipping: number) => number;
        getCartCount: () => number;
        loading: boolean;
        applyPromoCode: (code: string, customerId?: number) => Promise<void>;
        applyAutoPromoCodes: (customerId?: number) => Promise<void>;  // New: auto-apply eligible promos
        removePromoCode: (promoId?: number) => Promise<void>;  // Updated to accept optional promoId
        syncCart: () => Promise<void>;
        setCart: (cart: Cart) => void;
        itemsKey: string;
    }

    type SupabaseAuthContextType = {
        user: Customer | null;
        session: Session | null;
        loading: boolean;
        member: Member | null;
        signInWithGoogle: () => Promise<void>;
        signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
        signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
        signOut: () => Promise<void>;
    };
    type StatCard = {
        title: string;
        value: string | number;
        parValue: string | number;
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
        change: number;
    }

    type LangKey = 'en' | 'ar';
    type LangChangeListener = (lang: LangKey) => void;
    type MemberRole = 'admin' | 'moderator' | 'user' | 'distributor' | 'staff';
    interface SidebarStats {
        productsWarningCount: { products: number, reviews: number };
        materialsWarningCount: number;
        ordersWarningCount: { pending: number, processing: number, packing: number };
    }
}
