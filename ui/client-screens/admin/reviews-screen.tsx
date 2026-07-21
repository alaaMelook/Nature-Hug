"use client";

import { useState, useEffect } from "react";
import { ReviewAdminView } from "@/domain/entities/views/admin/reviewAdminView";
import { Search, Star, User, Package, Check, X as XIcon, Trash2, ImageIcon, Plus, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
    updateReviewStatusAction,
    deleteReviewImageAction,
    createReviewAction,
    deleteReviewAction,
} from "@/ui/hooks/admin/reviewActions";
import { toast } from "sonner";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getReviewImages } from "@/lib/services/reviewImageService";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProductOption {
    id: number;
    name: string;       // English name from API
    name_ar?: string;   // Arabic name (may not always be present)
    image_url?: string;
}

// ─── Add Review Modal ─────────────────────────────────────────────────────────
function AddReviewModal({
    open,
    onClose,
    onSuccess,
}: {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    const [products, setProducts] = useState<ProductOption[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [productSearch, setProductSearch] = useState("");
    const [productDropdownOpen, setProductDropdownOpen] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
    const [customerName, setCustomerName] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [status, setStatus] = useState<"approved" | "pending" | "rejected">("approved");
    const [submitting, setSubmitting] = useState(false);

    // Fetch products from admin API
    useEffect(() => {
        if (!open) return;
        setLoadingProducts(true);
        fetch("/api/admin/bundles/products") // reuses existing products list endpoint
            .then((r) => r.json())
            .then((data) => {
                // Try generic products endpoint
                setProducts(data?.products || data || []);
            })
            .catch(() => setProducts([]))
            .finally(() => setLoadingProducts(false));
    }, [open]);

    const filteredProducts = products.filter((p) => {
        const term = productSearch.toLowerCase();
        return (
            p.name?.toLowerCase().includes(term) ||
            p.name_ar?.toLowerCase().includes(term)
        );
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) {
            toast.error(isAr ? "الرجاء اختيار منتج" : "Please select a product");
            return;
        }
        setSubmitting(true);
        try {
            const result = await createReviewAction({
                product_id: selectedProduct.id,
                customer_name: customerName.trim() || "Admin",
                rating,
                comment: comment.trim() || undefined,
                status,
            });
            if (result.success) {
                toast.success(isAr ? "تم إضافة التقييم بنجاح" : "Review added successfully");
                onSuccess();
                onClose();
                // Reset
                setSelectedProduct(null);
                setCustomerName("");
                setRating(5);
                setComment("");
                setStatus("approved");
                setProductSearch("");
            } else {
                toast.error(result.error || (isAr ? "فشل إضافة التقييم" : "Failed to add review"));
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="add-review-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    key="add-review-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                {isAr ? "إضافة تقييم جديد" : "Add New Review"}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {isAr ? "أكتب التقييم الذي تريده على المنتج" : "Write a review for any product"}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

                        {/* Product Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                {isAr ? "المنتج *" : "Product *"}
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setProductDropdownOpen((v) => !v)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:border-primary-300 transition-all text-sm"
                                >
                                    <span className={selectedProduct ? "text-gray-900 font-medium" : "text-gray-400"}>
                                        {selectedProduct
                                            ? (isAr ? (selectedProduct.name_ar || selectedProduct.name) : selectedProduct.name)
                                            : (isAr ? "اختر منتجاً..." : "Select a product...")}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${productDropdownOpen ? "rotate-180" : ""}`} />
                                </button>

                                <AnimatePresence>
                                    {productDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                                        >
                                            <div className="p-2 border-b border-gray-100">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        placeholder={isAr ? "ابحث عن منتج..." : "Search products..."}
                                                        value={productSearch}
                                                        onChange={(e) => setProductSearch(e.target.value)}
                                                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-48 overflow-y-auto">
                                                {loadingProducts ? (
                                                    <div className="py-6 text-center text-gray-400 text-xs">
                                                        {isAr ? "جاري التحميل..." : "Loading..."}
                                                    </div>
                                                ) : filteredProducts.length === 0 ? (
                                                    <div className="py-6 text-center text-gray-400 text-xs">
                                                        {isAr ? "لا توجد منتجات" : "No products found"}
                                                    </div>
                                                ) : filteredProducts.map((p) => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedProduct(p);
                                                            setProductDropdownOpen(false);
                                                            setProductSearch("");
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-primary-50 transition-colors text-sm ${selectedProduct?.id === p.id ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-700"}`}
                                                    >
                                                        {p.image_url ? (
                                                            <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                                                <Image src={p.image_url} alt="" fill className="object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                                <Package className="w-4 h-4 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <span className="truncate">
                                            {isAr ? (p.name_ar || p.name) : p.name}
                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Customer Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                {isAr ? "اسم العميل" : "Customer Name"}
                            </label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder={isAr ? "اسم العميل (اختياري)" : "Customer name (optional)"}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent hover:border-gray-300 transition-all"
                            />
                        </div>

                        {/* Rating Stars */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {isAr ? "التقييم *" : "Rating *"}
                            </label>
                            <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <Star
                                            className={`w-8 h-8 transition-colors ${star <= rating
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-gray-200 fill-gray-200"
                                                }`}
                                        />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm font-bold text-gray-700">{rating}/5</span>
                            </div>
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                {isAr ? "التعليق" : "Comment"}
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                placeholder={isAr ? "اكتب تعليقك على المنتج..." : "Write your comment about the product..."}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent hover:border-gray-300 transition-all resize-none"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                {isAr ? "الحالة *" : "Status *"}
                            </label>
                            <div className="flex gap-2">
                                {(["approved", "pending", "rejected"] as const).map((s) => {
                                    const labels: Record<string, { ar: string; en: string; color: string; active: string }> = {
                                        approved: { ar: "موافق عليه", en: "Approved", color: "border-green-200 text-green-700 bg-green-50", active: "border-green-500 bg-green-500 text-white shadow-green-200 shadow-md" },
                                        pending: { ar: "معلق", en: "Pending", color: "border-yellow-200 text-yellow-700 bg-yellow-50", active: "border-yellow-500 bg-yellow-500 text-white shadow-yellow-200 shadow-md" },
                                        rejected: { ar: "مرفوض", en: "Rejected", color: "border-red-200 text-red-700 bg-red-50", active: "border-red-500 bg-red-500 text-white shadow-red-200 shadow-md" },
                                    };
                                    const info = labels[s];
                                    return (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setStatus(s)}
                                            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${status === s ? info.active : info.color + " hover:opacity-80"}`}
                                        >
                                            {isAr ? info.ar : info.en}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            {isAr ? "إلغاء" : "Cancel"}
                        </button>
                        <button
                            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                            disabled={submitting || !selectedProduct}
                            className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            {isAr ? "إضافة التقييم" : "Add Review"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function ReviewsScreen({ reviews: initialReviews }: { reviews: ReviewAdminView[] }) {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    const [reviews, setReviews] = useState<ReviewAdminView[]>(initialReviews);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [searchTerm, setSearchTerm] = useState("");
    const [updating, setUpdating] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [reviewImages, setReviewImages] = useState<{ [reviewId: number]: string[] }>({});
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [deletingImage, setDeletingImage] = useState<string | null>(null);
    const [addModalOpen, setAddModalOpen] = useState(false);

    // Keep reviews in sync with server-passed prop
    useEffect(() => { setReviews(initialReviews); }, [initialReviews]);

    // Fetch images for all reviews
    useEffect(() => {
        const fetchAllImages = async () => {
            const imagesMap: { [reviewId: number]: string[] } = {};
            for (const review of reviews) {
                try {
                    const images = await getReviewImages(review.id);
                    if (images.length > 0) {
                        imagesMap[review.id] = images;
                    }
                } catch (error) {
                    console.error(`Failed to fetch images for review ${review.id}:`, error);
                }
            }
            setReviewImages(imagesMap);
        };

        if (reviews.length > 0) {
            fetchAllImages();
        }
    }, [reviews]);

    const handleStatusUpdate = async (reviewId: number, newStatus: 'approved' | 'rejected' | 'pending') => {
        setUpdating(reviewId);
        try {
            const result = await updateReviewStatusAction(reviewId, newStatus);
            if (result.success) {
                setReviews((prev) =>
                    prev.map((r) => r.id === reviewId ? { ...r, status: newStatus } : r)
                );
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

    const handleDeleteReview = async (reviewId: number) => {
        if (!window.confirm(isAr ? "هل أنت متأكد من حذف هذا التقييم؟" : "Are you sure you want to delete this review?")) return;
        setDeleting(reviewId);
        try {
            const result = await deleteReviewAction(reviewId);
            if (result.success) {
                setReviews((prev) => prev.filter((r) => r.id !== reviewId));
                toast.success(isAr ? "تم حذف التقييم" : "Review deleted");
            } else {
                toast.error(result.error || (isAr ? "فشل الحذف" : "Failed to delete"));
            }
        } finally {
            setDeleting(null);
        }
    };

    const handleDeleteImage = async (reviewId: number, imageUrl: string) => {
        setDeletingImage(imageUrl);
        try {
            const result = await deleteReviewImageAction(reviewId, imageUrl);
            if (result.success) {
                setReviewImages(prev => ({
                    ...prev,
                    [reviewId]: prev[reviewId].filter(url => url !== imageUrl)
                }));
                toast.success(t("imageDeleted") || "تم حذف الصورة");
            } else {
                toast.error(result.error || t("imageDeleteFailed") || "فشل حذف الصورة");
            }
        } catch (error) {
            toast.error(t("imageDeleteFailed") || "فشل حذف الصورة");
        } finally {
            setDeletingImage(null);
        }
    };

    const filteredReviews = (reviews || []).filter((review) => {
        const matchesTab = review.status === activeTab;
        const matchesSearch =
            review.product_name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.product_name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesTab && matchesSearch;
    });

    const tabs = [
        { id: 'pending', label: t('pending') },
        { id: 'approved', label: t('approved') },
        { id: 'rejected', label: t('rejected') },
    ];

    return (
        <>
            <AddReviewModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSuccess={() => {
                    // Optimistic — server revalidation will update on next navigation.
                    // Switch tab to show the newly created review
                    setActiveTab("approved");
                }}
            />

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
                    {/* ── Add Review Button ── */}
                    <button
                        id="add-review-btn"
                        onClick={() => setAddModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-xl font-semibold text-sm shadow-md shadow-primary-200 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        {isAr ? "إضافة تقييم" : "Add Review"}
                    </button>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("images") || "الصور"}</th>
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
                                            <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
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
                                                        {review.product_image ? <Image src={review.product_image} alt={t("admin.reviews.altProduct")} fill={true} /> : <Package className="w-4 h-4" />}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{isAr ? review.product_name_ar : review.product_name_en}</div>
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
                                            <td className="px-6 py-4">
                                                {reviewImages[review.id] && reviewImages[review.id].length > 0 ? (
                                                    <div className="flex gap-1 flex-wrap max-w-[150px]">
                                                        {reviewImages[review.id].map((imageUrl, imgIndex) => (
                                                            <div key={imgIndex} className="relative group">
                                                                <button
                                                                    onClick={() => setSelectedImage(imageUrl)}
                                                                    className="relative w-10 h-10 rounded overflow-hidden border border-gray-200"
                                                                >
                                                                    <Image src={imageUrl} alt="" fill className="object-cover" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteImage(review.id, imageUrl)}
                                                                    disabled={deletingImage === imageUrl}
                                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm flex items-center gap-1">
                                                        <ImageIcon className="w-4 h-4" />
                                                        {t("noImages") || "لا يوجد"}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex gap-2 items-center">
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
                                                    {/* Delete Review */}
                                                    <button
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        disabled={deleting === review.id}
                                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                        title={isAr ? "حذف التقييم" : "Delete review"}
                                                    >
                                                        {deleting === review.id
                                                            ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                                            : <Trash2 className="w-4 h-4" />}
                                                    </button>
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
                                                <h3 className="text-sm font-semibold text-gray-900">{isAr ? review.product_name_ar : review.product_name_en}</h3>
                                                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                    <User className="w-3 h-3 mr-1" />
                                                    {review.customer_name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                                                <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                                                <span className="text-xs font-bold text-yellow-700">{review.rating}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteReview(review.id)}
                                                disabled={deleting === review.id}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                title={isAr ? "حذف" : "Delete"}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                        <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                                    </div>

                                    {/* Images in mobile view */}
                                    {reviewImages[review.id] && reviewImages[review.id].length > 0 && (
                                        <div className="flex gap-2 mb-3 flex-wrap">
                                            {reviewImages[review.id].map((imageUrl, imgIndex) => (
                                                <div key={imgIndex} className="relative group">
                                                    <button
                                                        onClick={() => setSelectedImage(imageUrl)}
                                                        className="relative w-12 h-12 rounded overflow-hidden border border-gray-200"
                                                    >
                                                        <Image src={imageUrl} alt="" fill className="object-cover" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteImage(review.id, imageUrl)}
                                                        disabled={deletingImage === imageUrl}
                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

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

                {/* Lightbox Modal */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
                            <Image
                                src={selectedImage}
                                alt="Review image"
                                fill
                                className="object-contain"
                            />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </>
    );
}
