'use client';
import { useCart } from "@/ui/providers/CartProvider";
import { GetProductsData } from "@/ui/hooks/store/useProductsData";
import { useTranslation } from "react-i18next";
import { CartItem, ProductView } from "@/domain/entities/views/shop/productView";
import { useEffect, useMemo, useState } from "react";

// Simple in-memory cache: lang:slug -> ProductView
const productCache = new Map<string, ProductView>();

export function useCartProducts() {
    const { cart } = useCart();
    const { i18n } = useTranslation();
    const lang = i18n.language as LangKey;
    const [isLoading, setIsLoading] = useState(true);
    // We use a counter to trigger re-renders when cache updates
    const [_, setTick] = useState(0);

    useEffect(() => {
        let mounted = true;
        const slugs = cart.items.map((item) => item.slug);

        if (slugs.length === 0) {
            setIsLoading(false);
            return;
        }

        const fetchMissing = async () => {
            const repo = new GetProductsData(lang);
            // Check cache using composite key
            const missingSlugs = slugs.filter(slug => !productCache.has(`${lang}:${slug}`));

            if (missingSlugs.length === 0) {
                if (mounted) setIsLoading(false);
                return;
            }

            if (mounted) setIsLoading(true);

            await Promise.all(missingSlugs.map(async (slug) => {
                try {
                    const product = await repo.bySlug(slug);
                    if (product) {
                        // Store with composite key
                        productCache.set(`${lang}:${slug}`, product);
                    }
                } catch (error) {
                    console.error(`Failed to fetch product ${slug}`, error);
                }
            }));

            if (mounted) {
                setIsLoading(false);
                setTick(t => t + 1); // Force re-render to pick up new cache values
            }
        };

        fetchMissing();

        return () => {
            mounted = false;
        };
    }, [cart.items, lang]); // Re-run if cart items or language changes

    // Merge product details from cache with current cart quantities
    const products: CartItem[] = useMemo(() => {
        return cart.items.map(item => {
            // Retrieve using composite key
            const cachedProduct = productCache.get(`${lang}:${item.slug}`);
            if (!cachedProduct) return null;
            return {
                ...cachedProduct,
                quantity: item.quantity
            };
        }).filter((item): item is CartItem => item !== null);
    }, [cart.items, _, lang]); // Re-calculate when cart items change, cache updates (tick), or language changes

    return { data: products, isLoading: isLoading && products.length < cart.items.length };
}
