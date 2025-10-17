import { Type } from "lucide-react";

export { };

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

  type FormEvent = React.FormEvent<HTMLFormElement>;
  type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
  type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
  type LangKey = 'en' | 'ar';
  type LangChangeListener = (lang: LangKey) => void;
  type MemberRole = 'admin' | 'moderator' | 'user';
}
