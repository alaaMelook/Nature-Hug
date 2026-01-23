'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Trash2, ShoppingCart, Loader2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCart } from '@/ui/providers/CartProvider';

interface WishlistItem {
    id: number;
    product_id: number;
    variant_id: number | null;
    created_at: string;
    product: {
        slug: string;
        name_en: string;
        name_ar: string;
        price: number;
        image_url: string | null;
        product_type: string;
    };
    variant: {
        id: number;
        name_en: string;
        name_ar: string;
        price: number | null;
        image: string | null;
        stock: number | null;
        slug: string | null;
    } | null;
    display_price: number;
    display_image: string | null;
    display_name_en: string;
    display_name_ar: string;
    display_slug: string;
    stock: number;
}

export function WishlistScreen() {
    const { t, i18n } = useTranslation();
    const { addToCart } = useCart();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<number | null>(null);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const res = await fetch('/api/wishlist');
            const data = await res.json();
            setItems(data.items || []);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (item: WishlistItem) => {
        setRemoving(item.id);
        try {
            let url = `/api/wishlist?product_id=${item.product_id}`;
            if (item.variant_id) {
                url += `&variant_id=${item.variant_id}`;
            }
            const res = await fetch(url, { method: 'DELETE' });
            if (res.ok) {
                setItems(prev => prev.filter(i => i.id !== item.id));
                toast.success(t('removedFromWishlist') || 'Removed from wishlist');
            }
        } catch (error) {
            console.error('Failed to remove:', error);
            toast.error('Failed to remove item');
        } finally {
            setRemoving(null);
        }
    };

    const getDisplayName = (item: WishlistItem) => {
        return i18n.language === 'ar' ? item.display_name_ar : item.display_name_en;
    };

    const handleAddToCart = async (item: WishlistItem) => {
        // Add to cart
        addToCart({
            id: item.product_id,
            variant_id: item.variant_id || 0,
            name: getDisplayName(item),
            description: null,
            price: item.display_price,
            stock: item.stock,
            discount: null,
            image: item.display_image,
            category_name: null,
            skin_type: '',
            slug: item.display_slug,
            product_type: item.product.product_type || 'normal',
            created_at: '',
            avg_rating: 0,
        }, 1);
        toast.success(t('addedToCart') || 'Added to cart');

        // Remove from wishlist
        try {
            let url = `/api/wishlist?product_id=${item.product_id}`;
            if (item.variant_id) {
                url += `&variant_id=${item.variant_id}`;
            }
            const res = await fetch(url, { method: 'DELETE' });
            if (res.ok) {
                setItems(prev => prev.filter(i => i.id !== item.id));
            }
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary-600" size={40} />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto p-4 sm:p-6"
        >
            <div className="flex items-center gap-3 mb-6">
                <Heart className="text-red-500" size={28} fill="currentColor" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {t('wishlist') || 'Wishlist'}
                </h1>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    {items.length} {t('items') || 'items'}
                </span>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                    <Heart className="mx-auto text-gray-300 mb-4" size={60} />
                    <h2 className="text-xl font-medium text-gray-600 mb-2">
                        {t('wishlistEmpty') || 'Your wishlist is empty'}
                    </h2>
                    <p className="text-gray-500 mb-6">
                        {t('wishlistEmptyDesc') || 'Browse products and add them to your wishlist'}
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <ShoppingCart className="mr-2" size={20} />
                        {t('browseProducts') || 'Browse Products'}
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                className="flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                            >
                                <Link href={`/products/${item.product.slug}`} className="shrink-0">
                                    <Image
                                        src={item.display_image || 'https://placehold.co/100x100'}
                                        alt={getDisplayName(item)}
                                        width={80}
                                        height={80}
                                        className="rounded-lg object-cover w-20 h-20"
                                        unoptimized
                                    />
                                </Link>

                                <div className="flex-1 min-w-0">
                                    <Link href={`/products/${item.product.slug}`}>
                                        <h3 className="font-medium text-gray-900 hover:text-primary-600 truncate">
                                            {getDisplayName(item)}
                                        </h3>
                                    </Link>
                                    {item.variant && (
                                        <span className="text-sm text-gray-500">
                                            {i18n.language === 'ar' ? item.variant.name_ar : item.variant.name_en}
                                        </span>
                                    )}
                                    <div className="text-primary-600 font-semibold">
                                        {t('{{price, currency}}', { price: item.display_price })}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center gap-1"
                                    >
                                        <Plus size={16} />
                                        {t('addToCart') || 'Add to Cart'}
                                    </button>
                                    <Link
                                        href={`/products/${item.product.slug}`}
                                        className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium"
                                    >
                                        {t('viewProduct') || 'View'}
                                    </Link>
                                    <button
                                        onClick={() => removeItem(item)}
                                        disabled={removing === item.id}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {removing === item.id ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <Trash2 size={20} />
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
}
