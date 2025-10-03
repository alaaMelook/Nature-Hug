"use client";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export function CartProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const Cookies = require("js-cookie");

  useEffect(() => {
    setIsClient(true);
    // Only access cookies after client-side hydration
    if (typeof window !== "undefined") {
      const savedCart = Cookies.get("cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error("Error parsing cart from cookies:", error);
          setCart([]);
        }
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && isClient && typeof window !== "undefined") {
      Cookies.set("cart", JSON.stringify(cart), { expires: 1 });
    }
  }, [cart, loading, isClient]);

  const addToCart = async (product: Product) => {
    const existingItemIndex = cart.findIndex(
      (item) => item.name_english === product.name_english
    );
    console.log(existingItemIndex);

    let newCart: CartItem[];
    if (existingItemIndex >= 0) {
      newCart = cart.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + 1 }
          : { ...item, quantity: 1 }
      );
    } else {
      const newItem: CartItem = {
        ...product,
        quantity: 1,
      };
      cart.push(newItem);
      newCart = [...cart];
    }
    toast.success(`${product.name_english} added to cart`, { duration: 2000 });
    setCart(newCart);
  };

  const removeFromCart = async (product: Product) => {
    const newCart = cart.filter(
      (item) => item.name_english !== product.name_english
    );
    setCart(newCart);
  };

  const updateQuantity = async (product: Product, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(product);
      return;
    }

    const newCart = cart.map((item) =>
      item.name_english === product.name_english ? { ...item, quantity } : item
    );
    setCart(newCart);
  };

  const clearCart = async () => {
    setCart([]);
  };

  const getCartNetTotal = () => {
    return cart.reduce(
      (acc, item) => acc + item.quantity * (item.price - (item.discount || 0) || 0),
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
      getCartTotal,
      getCartCount,
      getCartNetTotal,
    }),
    [cart, loading]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
