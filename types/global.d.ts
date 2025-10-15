export { };

declare global {



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
    addToCart: (product: Product, quantity: number) => Promise<void>;
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
