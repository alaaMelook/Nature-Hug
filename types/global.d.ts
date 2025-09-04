export {};

declare global {
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

  interface CartItem extends Product {
    quantity: number;
  }

  interface User {
    id: string;
    email: string;
    name?: string;
  }

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

  type FormEvent = React.FormEvent<HTMLFormElement>;
  type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
  type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
}
