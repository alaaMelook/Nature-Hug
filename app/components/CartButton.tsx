"use client";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useTranslation } from "./TranslationProvider";
import { useCart } from "@/lib/CartContext";

export default function AddToCartButton({
  product,
}: Readonly<{ product: Product }>) {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const handleClick = async () => {
    setLoading(true);
    try {
      addToCart(product);
    } catch (err) {
      console.error("Error adding to cart:", err);
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
      {loading ? "..." : t("addToCart")}
    </button>
  );
}
