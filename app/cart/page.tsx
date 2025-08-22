"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Product {
  id: number;
  name_english: string;
  price: number;
  image_url: string | null;
}

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product?: Product;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);

      const { data: cartData, error: cartError } = await supabase
        .from("cart_items")
        .select("id, product_id, quantity");

      if (cartError) {
        console.error("Error fetching cart:", cartError.message);
        setLoading(false);
        return;
      }

      if (!cartData || cartData.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const productIds = cartData.map((c) => c.product_id);

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("id, name_english, price, image_url")
        .in("id", productIds);

      if (productError) {
        console.error("Error fetching products:", productError.message);
        setLoading(false);
        return;
      }

      const cartItems = cartData.map((item) => ({
        ...item,
        product: productData?.find((p) => p.id === item.product_id),
      }));

      setItems(cartItems);
      setLoading(false);
    };

    fetchCart();
  }, []);

  if (loading) return <p className="p-8 text-center">Loading cart...</p>;

  if (items.length === 0)
    return <p className="p-8 text-center">Your cart is empty.</p>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-white shadow p-4 rounded-lg"
          >
            <div className="flex items-center gap-4">
              {item.product?.image_url ? (
                <img
                  src={item.product.image_url}
                  alt={item.product.name_english}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">
                  No Image
                </div>
              )}
              <div>
                <p className="font-semibold">{item.product?.name_english}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} × {item.product?.price} EGP
                </p>
              </div>
            </div>
            <p className="font-bold">
              {(item.quantity * (item.product?.price || 0)).toFixed(2)} EGP
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
