"use client";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";

type CartItem = {
  product_id: number;
  quantity: number;
};

export default function AddToCartButton({
  productId,
}: Readonly<{ productId: number }>) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });

      if (res.status === 401) {
        // 🔹 Guest mode: store in localStorage
        let cart: CartItem[] = [];

        try {
          const stored = localStorage.getItem("guest_cart");
          cart = stored ? JSON.parse(stored) : [];
          if (!Array.isArray(cart)) cart = []; // safety check
        } catch {
          cart = [];
        }

        const existing = cart.find((c) => c.product_id === productId);
        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push({ product_id: productId, quantity: 1 });
        }

        localStorage.setItem("guest_cart", JSON.stringify(cart));
        alert("🛒 Added to guest cart!");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to add to cart");
        return;
      }

      alert("✅ Added to cart!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Error adding to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="mt-4 w-full bg-[#8B4513] text-white py-2.5 rounded-lg shadow-md hover:bg-[#A0522D] transition-colors duration-300 flex items-center justify-center disabled:opacity-50"
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      {loading ? "..." : "Add to Cart"}
    </button>
  );
}
