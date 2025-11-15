"use client";

import { useRouter } from 'next/navigation';
import { useCart } from '@/ui/providers/CartProvider';
import { useState } from 'react';
import { ProductView } from '@/domain/entities/views/shop/productView';
import { ProductDetailView } from '@/domain/entities/views/shop/productDetailView';
import { useTranslation } from '@/ui/providers/TranslationProvider';

export default function BuyNowButton({ product, quantity }: { product: ProductView | ProductDetailView, quantity: number }) {
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
            className={`w-full py-2.5 rounded-lg shadow-md flex items-center justify-center transition-colors duration-300 
      ${loading || isDisabled ? "bg-gray-400 text-gray-200" : "bg-primary-700 text-primary-50 hover:bg-primary-200 hover:text-primary-700 cursor-pointer"}
      disabled:opacity-50`}
            disabled={!product.stock}
        >
            {t("BuyNow")}
        </button>
    );
}