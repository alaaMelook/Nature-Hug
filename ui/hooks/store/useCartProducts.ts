'use client';
import { useCart } from "@/ui/providers/CartProvider";
import { GetProductsData } from "@/ui/hooks/store/useProductsData";
import { useTranslation } from "react-i18next";
import { CartItem } from "@/domain/entities/views/shop/productView";
import { useEffect, useMemo, useState } from "react";

export function useCartProducts() {
    const { cart, loading: cartLoading } = useCart();
    const { i18n } = useTranslation();
    const lang = i18n.language as LangKey;
    const [isLoading, setIsLoading] = useState(true);
    // We use a counter to trigger re-renders and re-fetches
    const [tick, setTick] = useState(0);
    const [products, setProducts] = useState<CartItem[]>([]);

    const refresh = () => {
        setTick(prev => prev + 1);
    };

    useEffect(() => {
        let mounted = true;
        const slugs = cart.items.map((item) => item.slug);

        if (slugs.length === 0) {
            if (mounted) {
                setProducts([]);
                setIsLoading(false);
            }
            return;
        }

        const fetchData = async () => {
            if (mounted) setIsLoading(true);
            const repo = new GetProductsData(lang);

            // Allow bypassing cache if the repo supports it, or just plain fetch
            // Since we want fresh stock, we fetch all current cart items again
            const newProducts: CartItem[] = [];

            try {
                await Promise.all(slugs.map(async (slug) => {
                    try {
                        const product = await repo.bySlug(slug);
                        if (product) {
                            newProducts.push({
                                ...product,
                                quantity: cart.items.find(i => i.slug === slug)?.quantity || 0
                            });
                        }
                    } catch (error) {
                        console.error(`Failed to fetch product ${slug}`, error);
                    }
                }));
            } finally {
                if (mounted) {
                    setProducts(newProducts);
                }
                setIsLoading(false);
            }
        };

        fetchData();

        return () => {
            mounted = false;
        };
    }, [cart.items, lang, tick]); // Re-run if cart items, language, or tick changes

    return { data: products, isLoading: cartLoading || isLoading, refresh };
}
