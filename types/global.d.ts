import React from "react";

export {};

declare global {


    interface ApiResponse<T = any> {
        data?: T;
        error?: string;
        success: boolean;
    }

    interface CartContextType {
        cart: CartItem[];
        addToCart: (product: Product, quantity: number) => Promise<void>;
        removeFromCart: (product: Product) => Promise<void>;
        updateQuantity: (product: Product, quantity: number) => Promise<void>;
        clearCart: () => Promise<void>;
        getCartTotal: () => number;
        getCartNetTotal: () => number;
        getCartCount: () => number;
        totalDiscount: number;
        loading: boolean;
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
}
