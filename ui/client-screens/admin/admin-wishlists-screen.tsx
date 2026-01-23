'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Users, Package, Loader2, TrendingUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface WishlistStats {
    total_items: number;
    unique_customers: number;
    unique_products: number;
}

interface PopularProduct {
    product_id: number;
    variant_id: number | null;
    count: number;
    product: {
        slug: string;
        name_en: string;
        name_ar: string;
        price: number;
        image_url: string | null;
    };
    variant: {
        name_en: string;
        name_ar: string;
        image: string | null;
    } | null;
    display_name: string;
    display_image: string | null;
}

interface WishlistItem {
    id: number;
    product_id: number;
    variant_id: number | null;
    customer_id: number;
    created_at: string;
    product: { slug: string; name_en: string; name_ar: string; price: number; image_url: string | null };
    variant: { id: number; name_en: string; name_ar: string; price: number | null; image: string | null } | null;
    customer: { id: number; name: string; phone: string; email: string };
    display_name_en: string;
    display_name_ar: string;
    display_price: number;
    display_image: string | null;
}

export function AdminWishlistsScreen() {
    const { t, i18n } = useTranslation();
    const [stats, setStats] = useState<WishlistStats | null>(null);
    const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/wishlists');
                const data = await res.json();
                setStats(data.stats);
                setPopularProducts(data.popular_products || []);
                setItems(data.items || []);
            } catch (error) {
                console.error('Failed to fetch wishlists:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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
            className="space-y-6"
        >
            <div className="flex items-center gap-3">
                <Heart className="text-red-500" size={28} fill="currentColor" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {t('wishlists') || 'Wishlists'}
                </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Items Card */}
                <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <Heart className="text-red-600" size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats?.total_items || 0}</p>
                            <p className="text-sm text-gray-500">Total Wishlist Items</p>
                        </div>
                    </div>
                </div>

                {/* Customers Card - Click to Expand */}
                <div
                    className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setExpandedCard(expandedCard === 'customers' ? null : 'customers')}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats?.unique_customers || 0}</p>
                                <p className="text-sm text-gray-500">Customers with Wishlists</p>
                            </div>
                        </div>
                        <ChevronDown className={`text-gray-400 transition-transform ${expandedCard === 'customers' ? 'rotate-180' : ''}`} size={20} />
                    </div>
                    {expandedCard === 'customers' && items.length > 0 && (
                        <div className="border-t pt-3 mt-4 max-h-48 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            {[...new Map(items.map(item => [item.customer.id, item.customer])).values()].map((customer) => (
                                <Link
                                    key={customer.id}
                                    href={`/admin/customers/${customer.id}`}
                                    className="flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded text-sm"
                                >
                                    <span className="font-medium text-gray-700">{customer.name || 'Unknown'}</span>
                                    <span className="text-gray-400 text-xs">{customer.phone}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Products Card - Click to Expand */}
                <div
                    className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setExpandedCard(expandedCard === 'products' ? null : 'products')}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Package className="text-green-600" size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats?.unique_products || 0}</p>
                                <p className="text-sm text-gray-500">Products in Wishlists</p>
                            </div>
                        </div>
                        <ChevronDown className={`text-gray-400 transition-transform ${expandedCard === 'products' ? 'rotate-180' : ''}`} size={20} />
                    </div>
                    {expandedCard === 'products' && popularProducts.length > 0 && (
                        <div className="border-t pt-3 mt-4 max-h-48 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            {popularProducts.map((item) => (
                                <Link
                                    key={item.product_id}
                                    href={`/products/${item.product.slug}`}
                                    className="flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded text-sm"
                                >
                                    <span className="font-medium text-gray-700 truncate max-w-[180px]">
                                        {i18n.language === 'ar' ? item.product.name_ar : item.product.name_en}
                                    </span>
                                    <span className="text-red-500 flex items-center gap-1">
                                        <Heart size={12} fill="currentColor" />
                                        {item.count}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Popular Products */}
            {popularProducts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="text-orange-500" size={20} />
                        {t('mostWishlisted') || 'Most Wishlisted Products'}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {popularProducts.map((item, index) => (
                            <Link
                                key={`${item.product_id}_${item.variant_id || 0}_${index}`}
                                href={`/products/${item.product.slug}`}
                                className="group block"
                            >
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 relative">
                                    <Image
                                        src={item.display_image || 'https://placehold.co/100x100'}
                                        alt={item.display_name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                        unoptimized
                                    />
                                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <Heart size={10} fill="currentColor" />
                                        {item.count}
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600">
                                    {item.display_name}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Wishlist Items Table */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('recentWishlistActivity') || 'Recent Wishlist Activity'}
                </h2>
                {items.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('product') || 'Product'}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('customer') || 'Customer'}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('date') || 'Date'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {items.slice(0, 20).map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <Link href={`/products/${item.product.slug}`} className="flex items-center gap-3 hover:text-primary-600">
                                                <Image
                                                    src={item.display_image || 'https://placehold.co/40x40'}
                                                    alt=""
                                                    width={40}
                                                    height={40}
                                                    className="rounded-lg"
                                                    unoptimized
                                                />
                                                <div>
                                                    <span className="font-medium text-sm">
                                                        {i18n.language === 'ar' ? item.display_name_ar : item.display_name_en}
                                                    </span>
                                                    {item.variant && (
                                                        <div className="text-xs text-gray-500">
                                                            {i18n.language === 'ar' ? item.variant.name_ar : item.variant.name_en}
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link href={`/admin/customers/${item.customer.id}`} className="hover:text-primary-600">
                                                <div className="text-sm font-medium">{item.customer.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{item.customer.phone}</div>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">{t('noWishlistItems') || 'No wishlist items yet'}</p>
                )}
            </div>
        </motion.div>
    );
}
