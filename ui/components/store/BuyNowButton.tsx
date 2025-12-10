"use client";

import { useRouter } from 'next/navigation';
import { useCart } from '@/ui/providers/CartProvider';
import { useState } from 'react';
import { ProductView } from '@/domain/entities/views/shop/productView';
import { ProductDetailView } from '@/domain/entities/views/shop/productDetailView';
import { useTranslation } from 'react-i18next';

export default function BuyNowButton({ product, quantity, className }: { product: ProductView | ProductDetailView, quantity: number, className?: string }) {
    const router = useRouter();
    const { addToCart } = useCart();
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const isDisabled = product.stock === 0 || product.stock == null;
    const handleBuyNow = async () => {
        setLoading(true);
        await addToCart(product, quantity);
        router.push('/cart');
        setLoading(false);
    };

    return (
        <button
            onClick={isDisabled ? undefined : handleBuyNow}
            className={`w-full py-2.5 rounded-lg shadow-md flex items-center justify-center transition-colors duration-300 text-xs sm:text-sm font-medium ${className}
      ${loading || isDisabled ? "bg-gray-400 text-gray-200" : "bg-primary-700 text-primary-50 hover:bg-primary-200 hover:text-primary-700 cursor-pointer"}
      disabled:opacity-50`}
            disabled={!product.stock}
        >
            {t("BuyNow")}
        </button>
    );
}