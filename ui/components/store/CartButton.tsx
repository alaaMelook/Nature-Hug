"use client";
import { useState } from "react";
import { BadgeAlert, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
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
            className={` w-full py-2.5 px-1 rounded-lg shadow-md flex items-center justify-center transition-colors duration-300 text-xs sm:text-sm font-semibold align-text-top
      ${loading || isDisabled ? "bg-gray-400 text-gray-200" : " text-primary-900 border-1 border-primary-900 rounded-md"}
      disabled:opacity-50`}
        >
            {isDisabled ? <BadgeAlert className="sm:w-4 sm:h-4 w-3 h-3 mx-1 -mt-1" /> : <ShoppingCart className="sm:w-4 sm:h-4 w-3 h-3 mx-1 -mt-1" />}
            {loading ? "..." :
                isDisabled ? t("outOfStock") :
                    t("addToCart")}
        </button>
    );
}
