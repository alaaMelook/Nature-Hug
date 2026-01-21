import { CartItem } from "@/domain/entities/views/shop/productView";
import React from "react";

export { };

declare global {


    interface ApiResponse<T = any> {
        data?: T;
        error?: string;
        success: boolean;
    }
    interface Cart {
        promoCode: string | null;
        promoCodeId: number | null;
        discount: number;
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
        removePromoCode: () => Promise<void>;
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
    type MemberRole = 'admin' | 'moderator' | 'user';
    interface SidebarStats {
        productsWarningCount: { products: number, reviews: number };
        materialsWarningCount: number;
        ordersWarningCount: { pending: number, processing: number };
    }
}
