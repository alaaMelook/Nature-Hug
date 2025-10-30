"use client";
import { useState } from "react";
import { ShoppingCart, BadgeAlert } from "lucide-react";
import { useTranslation } from "@/ui/providers/TranslationProvider";
import { useCart } from "@/ui/providers/CartProvider";
import { ProductView } from "@/domain/entities/views/shop/productView";
import { ProductDetailView } from "@/domain/entities/views/shop/productDetailView";


export default function AddToCartButton({
  product,
  quantity,
}: Readonly<{ product: ProductView | ProductDetailView, quantity: number }>) {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const isDisabled = product.stock === 0 || product.stock == null;

  const handleClick = async () => {
    try {
      setLoading(true);
      await addToCart(product, quantity);
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={isDisabled ? undefined : handleClick}
      disabled={loading || product.stock === 0}
      className={` w-full py-2.5 rounded-lg shadow-md flex items-center justify-center transition-colors duration-300
      ${loading || isDisabled ? "bg-gray-400 text-gray-200" : "bg-primary-50 text-primary-900 hover:bg-primary-200 hover:text-primary-700 cursor-pointer"}
      disabled:opacity-50`}
    >
      {isDisabled ? <BadgeAlert className="w-4 h-4 mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
      {loading ? "..." :
        isDisabled ? t("outOfStock") :
          t("addToCart")}
    </button>
  );
}
