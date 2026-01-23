'use client';

import { ProfileView } from "@/domain/entities/views/shop/profileView";
import { OrderSummaryView } from "@/domain/entities/views/shop/orderSummaryView";

import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Calendar, Shield, User, Package, Heart, Loader2 } from "lucide-react";
import { Member } from "@/domain/entities/auth/member";
import { motion } from "framer-motion";
import Image from "next/image";

interface CustomerProfileScreenProps {
    customer: ProfileView;
    orders: OrderSummaryView[];
    member: Member | null;
    onPromote: (role: MemberRole) => Promise<void>;
    onRevoke: () => Promise<void>;
}


export function CustomerProfileScreen({ customer, orders, member, onPromote, onRevoke }: CustomerProfileScreenProps) {
    const { t, i18n } = useTranslation();
    const [isPromoting, setIsPromoting] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);

    // Wishlist state
    interface WishlistItem {
        id: number;
        product_id: number;
        product: { slug: string; name_en: string; name_ar: string; price: number; image_url: string | null };
    }
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [loadingWishlist, setLoadingWishlist] = useState(true);

    // Fetch wishlist on mount
    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const res = await fetch(`/api/admin/customers/${customer.id}/wishlist`);
                const data = await res.json();
                setWishlistItems(data.items || []);
            } catch (error) {
                console.error('Failed to fetch wishlist:', error);
            } finally {
                setLoadingWishlist(false);
            }
        };
        fetchWishlist();
    }, [customer.id]);

    const handlePromote = async (role: MemberRole) => {
        setIsPromoting(true);
        try {
            await onPromote(role);
        } catch (error) {
            console.error("Failed to promote customer:", error);
        } finally {
            setIsPromoting(false);
        }
    };

    const handleRevoke = async () => {
        if (!confirm(t("confirmRevokeRole"))) return;
        setIsRevoking(true);
        try {
            await onRevoke();
        } catch (error) {
            console.error("Failed to revoke role:", error);
        } finally {
            setIsRevoking(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">{customer.name}</h2>
                    <div className="flex items-center mt-2 space-x-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            ID: {customer.id}
                        </span>
                        {member && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                <Shield className="w-3 h-3 mr-1" />
                                {t(member.role)}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex space-x-2">
                    {member ? (
                        <>
                            <button
                                onClick={handleRevoke}
                                disabled={isRevoking}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                            >
                                {t("revokeRole")}
                            </button>
                            {member.role === 'moderator' && (
                                <button
                                    onClick={() => handlePromote('admin')}
                                    disabled={isPromoting}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                >
                                    {t("makeAdmin")}
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => handlePromote('moderator')}
                                disabled={isPromoting}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                {t("makeModerator")}
                            </button>
                            <button
                                onClick={() => handlePromote('admin')}
                                disabled={isPromoting}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                {t("makeAdmin")}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer Details Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white shadow rounded-lg p-6 md:col-span-1"
                >
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        {t("customerDetails")}
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">{t("email")}</p>
                                <p className="text-sm text-gray-900">{customer.email}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">{t("phone")}</p>
                                {customer.phone.length > 0 ? (
                                    customer.phone.map((p, i) => (
                                        <p key={i} className="text-sm text-gray-900">{p}</p>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">{t("noPhone")}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-start">
                            <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">{t("addresses")}</p>
                                {customer.address && customer.address.length > 0 ? (
                                    customer.address.map((addr) => (
                                        <div key={addr.id} className="mb-2 last:mb-0">
                                            <p className="text-sm text-gray-900">{addr.address}</p>
                                            <p className="text-xs text-gray-500">{addr.governorate.name_en}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">{t("noAddress")}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">{t("joinedDate")}</p>
                                <p className="text-sm text-gray-900">{new Date(customer.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Order History */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white shadow rounded-lg p-6 md:col-span-2"
                >
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Package className="w-5 h-5 mr-2" />
                        {t("orderHistory")}
                    </h3>
                    <div className="overflow-hidden">
                        {orders.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t("orderId")}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t("date")}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t("status")}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t("total")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <tr key={order.order_id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{order.order_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${order.order_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                    {t(order.order_status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {order.grand_total}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500 text-sm">{t("noOrders")}</p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Wishlist Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white shadow rounded-lg p-6"
            >
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-500" fill="currentColor" />
                    {t("wishlist") || "Wishlist"}
                    <span className="ml-2 text-sm text-gray-500">({wishlistItems.length})</span>
                </h3>

                {loadingWishlist ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-gray-400" size={24} />
                    </div>
                ) : wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {wishlistItems.map((item) => (
                            <a
                                key={item.id}
                                href={`/products/${item.product.slug}`}
                                className="group block"
                            >
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                                    <Image
                                        src={item.product.image_url || 'https://placehold.co/100x100'}
                                        alt={i18n.language === 'ar' ? item.product.name_ar : item.product.name_en}
                                        width={150}
                                        height={150}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600">
                                    {i18n.language === 'ar' ? item.product.name_ar : item.product.name_en}
                                </p>
                                <p className="text-sm text-primary-600">
                                    {t('{{price, currency}}', { price: item.product.price })}
                                </p>
                            </a>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                        {t("emptyWishlist") || "This customer has no items in their wishlist"}
                    </p>
                )}
            </motion.div>
        </motion.div>
    );
}
