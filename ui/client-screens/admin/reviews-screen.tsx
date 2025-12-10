"use client";

import { useState } from "react";
import { ReviewAdminView } from "@/domain/entities/views/admin/reviewAdminView";
import { Search, Star, User, Package, Check, X as XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { updateReviewStatusAction } from "@/ui/hooks/admin/reviewActions";
import { toast } from "sonner";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function ReviewsScreen({ reviews }: { reviews: ReviewAdminView[] }) {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [searchTerm, setSearchTerm] = useState("");
    const [updating, setUpdating] = useState<number | null>(null);

    const handleStatusUpdate = async (reviewId: number, newStatus: 'approved' | 'rejected' | 'pending') => {
        setUpdating(reviewId);
        try {
            const result = await updateReviewStatusAction(reviewId, newStatus);
            if (result.success) {
                toast.success(t("statusUpdated"));
            } else {
                toast.error(t("statusUpdateFailed"));
            }
        } catch (error) {
            toast.error(t("statusUpdateFailed"));
        } finally {
            setUpdating(null);
        }
    };

    const filteredReviews = (reviews || []).filter((review) => {
        const matchesTab = review.status === activeTab;
        const matchesSearch =
            review.product_name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.product_name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesTab && matchesSearch;
    });

    const tabs = [
        { id: 'pending', label: t('pending') },
        { id: 'approved', label: t('approved') },
        { id: 'rejected', label: t('rejected') },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t("reviews")}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t("manageReviews")}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                ${activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            {tab.label}
                            <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${activeTab === tab.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-900'
                                }`}>
                                {reviews.filter(r => r.status === tab.id).length}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t("searchReviews")}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Reviews List */}
            <div className="md:bg-white rounded-xl md:shadow-sm md:border md:border-gray-200 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("product")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("customer")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("rating")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("comment")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("date")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <AnimatePresence>
                                {filteredReviews.length === 0 ? (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                            {t("noReviewsFound")}
                                        </td>
                                    </motion.tr>
                                ) : filteredReviews.map((review, index) => (
                                    <motion.tr
                                        key={review.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 flex-shrink-0 relative rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                                                    {review.product_image ? <Image src={review.product_image} alt="product" fill={true} /> : <Package className="w-4 h-4" />}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{i18n.language === "ar" ? review.product_name_ar : review.product_name_en}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{review.customer_name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="ml-1 text-sm text-gray-900">{review.rating}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 max-w-xs truncate" title={review.comment}>
                                                {review.comment}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex gap-2">
                                                {review.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(review.id, 'approved')}
                                                            disabled={updating === review.id}
                                                            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                                            title={t("approve")}
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(review.id, 'rejected')}
                                                            disabled={updating === review.id}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                                            title={t("reject")}
                                                        >
                                                            <XIcon className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                                {review.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(review.id, 'rejected')}
                                                        disabled={updating === review.id}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                                        title={t("reject")}
                                                    >
                                                        <XIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {review.status === 'rejected' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(review.id, 'approved')}
                                                        disabled={updating === review.id}
                                                        className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                                        title={t("approve")}
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Mobile Grid/Cards */}
                <div className="md:hidden grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {filteredReviews.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-10 text-gray-500"
                            >
                                {t("noReviewsFound")}
                            </motion.div>
                        ) : filteredReviews.map((review, index) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                            {review.product_image ? <Image src={review.product_image} alt="product" width={32} height={32} /> : <Package className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">{i18n.language === "ar" ? review.product_name_ar : review.product_name_en}</h3>
                                            <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                <User className="w-3 h-3 mr-1" />
                                                {review.customer_name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                                        <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                                        <span className="text-xs font-bold text-yellow-700">{review.rating}</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                    <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                                </div>

                                <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-3">
                                    <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                    <div className="flex gap-2">
                                        {review.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(review.id, 'approved')}
                                                    disabled={updating === review.id}
                                                    className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(review.id, 'rejected')}
                                                    disabled={updating === review.id}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                                >
                                                    <XIcon className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                        {review.status === 'approved' && (
                                            <button
                                                onClick={() => handleStatusUpdate(review.id, 'rejected')}
                                                disabled={updating === review.id}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                            >
                                                <XIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                        {review.status === 'rejected' && (
                                            <button
                                                onClick={() => handleStatusUpdate(review.id, 'approved')}
                                                disabled={updating === review.id}
                                                className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
