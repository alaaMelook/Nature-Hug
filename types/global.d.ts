// types/global.d.ts
export {}; // Make this a module

declare global {
  // Product type
  interface Product {
    id: number;
    created_at: string;
    name_english: string | null;
    name_arabic: string | null;
    description_english: string | null;
    description_arabic: string | null;
    price: number;
    discount: number | null;
    quantity: number | null;
    image_url: string | null;
  }

  // Cart item extends Product with quantity
  interface CartItem extends Product {
    quantity: number;
  }

  // User type
  interface User {
    id: string;
    email: string;
    name?: string;
  }

  // API response types
  interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    success: boolean;
  }
  interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product) => Promise<void>;
    removeFromCart: (product: Product) => Promise<void>;
    updateQuantity: (product: Product, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    getCartTotal: () => number;
    getCartNetTotal: () => number;
    getCartCount: () => number;
  }

  // Form event types
  type FormEvent = React.FormEvent<HTMLFormElement>;
  type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
  type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
}
