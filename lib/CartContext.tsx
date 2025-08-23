"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  use,
  useMemo,
} from "react";

type CartItem = {
  product_id: number;
  name: string;
  price: number;
  image_url?: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.product_id === item.product_id);
      if (existing) {
        return prev.map((p) =>
          p.product_id === item.product_id
            ? { ...p, quantity: p.quantity + item.quantity }
            : p
        );
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setCart((prev) =>
      prev.map((p) => (p.product_id === productId ? { ...p, quantity } : p))
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((p) => p.product_id !== productId));
  };

  const clearCart = () => setCart([]);
  const value = useMemo(
    () => ({ cart, addToCart, updateQuantity, removeFromCart, clearCart }),
    [cart]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
