"use client";

import React, { useState, useEffect } from "react";
import { BundleDetailView } from "@/domain/entities/views/shop/bundleDetailView";
import { useCart } from "@/ui/providers/CartProvider";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Check, ShoppingBag, ShoppingCart, Info, Percent } from "lucide-react";
import { toast } from "sonner";

export function BundleCustomizerScreen({ bundle, lang }: { bundle: BundleDetailView, lang: string }) {
    const { addToCart } = useCart();
    const { t } = useTranslation();
    const router = useRouter();
    const isAr = lang === 'ar';

    // State mapping product_id to selected variant_id
    const [selections, setSelections] = useState<Record<number, number>>({});
    // State mapping product_id to full selected variant object (for displaying name/scent on cart)
    const [selectionDetails, setSelectionDetails] = useState<Record<number, { id: number, name: string, price: number }>>({});

    // Auto-select first variant on load for each product that has variants
    useEffect(() => {
        const initialSelections: Record<number, number> = {};
        const initialDetails: Record<number, { id: number, name: string, price: number }> = {};

        for (const item of bundle.items) {
            if (item.has_variants && item.variants.length > 0) {
                const firstVar = item.variants[0];
                initialSelections[item.product_id] = firstVar.id;
                initialDetails[item.product_id] = {
                    id: firstVar.id,
                    name: isAr ? firstVar.name_ar : firstVar.name_en,
                    price: firstVar.price
                };
            }
        }
        setSelections(initialSelections);
        setSelectionDetails(initialDetails);
    }, [bundle, isAr]);

    const handleSelectVariant = (productId: number, variant: any) => {
        setSelections(prev => ({
            ...prev,
            [productId]: variant.id
        }));
        setSelectionDetails(prev => ({
            ...prev,
            [productId]: {
                id: variant.id,
                name: isAr ? variant.name_ar : variant.name_en,
                price: variant.price
            }
        }));
    };

    const handleAddToCart = async () => {
        // Validate that all products with variants have a selection
        for (const item of bundle.items) {
            if (item.has_variants && !selections[item.product_id]) {
                toast.error(isAr ? "يرجى اختيار المكونات لجميع المنتجات" : "Please select options for all products");
                return;
            }
        }

        // Format selected variants details to append to the product name or metadata
        const detailsList = Object.values(selectionDetails).map(d => d.name).join(" + ");
        const formattedName = `${bundle.name} (${detailsList})`;

        // Build a custom ProductView mapped object representing this configured bundle
        const configuredBundle: any = {
            id: bundle.id,
            variant_id: 0, // 0 denotes custom configured bundle
            name: formattedName,
            description: bundle.description,
            price: bundle.original_total,
            stock: bundle.stock,
            discount: bundle.discount > 0 ? bundle.discount : null,
            image: bundle.image || (bundle.items[0]?.product?.image ?? null),
            category_name: bundle.category_name,
            slug: `bundle-${bundle.slug}`,
            product_type: "bundle",
            selected_variants: selectionDetails // metadata configuration for backend/checkout
        };

        try {
            await addToCart(configuredBundle, 1);
            router.push("/cart");
        } catch (err: any) {
            console.error("Cart error:", err);
            toast.error(t("failedToAdd"));
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Column 1 & 2 — Bundle details & items configuration */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header info card */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100">
                        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                            <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-gray-150">
                                <Image
                                    src={bundle.image || "https://placehold.co/200x200/D1D5DB/4B5563?text=Bundle"}
                                    alt={bundle.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full inline-block mb-2">
                                    {bundle.category_name}
                                </span>
                                <h1 className="text-2xl sm:text-3xl font-extrabold font-cairo text-primary-950">
                                    {bundle.name}
                                </h1>
                                <p className="text-gray-500 text-sm mt-1 font-cairo">
                                    {bundle.description || (isAr ? "قم بتعديل وتخصيص باقتك الآن." : "Customize and order your bundle package.")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Products list configuration slots */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-gray-800 font-cairo px-1">
                            {isAr ? "مكونات الباقة المشمولة:" : "Configure Bundle Products:"}
                        </h2>

                        {bundle.items.map((item, idx) => {
                            const prod = item.product;
                            const hasVariants = item.has_variants && item.variants.length > 0;
                            const currentSelectionId = selections[item.product_id];

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                                    className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col md:flex-row gap-6"
                                >
                                    {/* Item Product image */}
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-100 mx-auto md:mx-0">
                                        <Image
                                            src={prod.image || "https://placehold.co/100x100/D1D5DB/4B5563?text=Product"}
                                            alt={prod.name}
                                            fill
                                            className="object-cover"
                                        />
                                        {item.quantity > 1 && (
                                            <div className="absolute top-1 right-1 bg-primary-800 text-white text-xxs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                                x{item.quantity}
                                            </div>
                                        )}
                                    </div>

                                    {/* Item Product configuration content */}
                                    <div className="flex-grow space-y-4">
                                        <div>
                                            <h3 className="text-md font-bold text-gray-900 font-cairo text-center md:text-start">
                                                {prod.name} {item.quantity > 1 && <span className="text-primary-700">({isAr ? `عدد ${item.quantity}` : `Qty ${item.quantity}`})</span>}
                                            </h3>
                                            <p className="text-gray-500 text-xs mt-1 line-clamp-2 font-cairo text-center md:text-start">
                                                {prod.description}
                                            </p>
                                        </div>

                                        {/* Variants Selector */}
                                        {hasVariants ? (
                                            <div className="space-y-2">
                                                <label className="block text-xs font-semibold text-gray-400 font-cairo">
                                                    {isAr ? "اختر النوع / الرائحة المفضلة:" : "Select Scent / Option:"}
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {item.variants.map((v) => {
                                                        const isSelected = currentSelectionId === v.id;
                                                        const optionName = isAr ? v.name_ar : v.name_en;

                                                        return (
                                                            <button
                                                                key={v.id}
                                                                onClick={() => handleSelectVariant(item.product_id, v)}
                                                                className={`px-4 py-2 rounded-xl text-xs font-semibold font-cairo border-2 transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                                                                    isSelected
                                                                        ? "bg-primary-900 border-primary-900 text-white shadow-xs"
                                                                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                                                                }`}
                                                            >
                                                                {isSelected && <Check size={12} />}
                                                                <span>{optionName}</span>
                                                                {v.stock <= 0 && (
                                                                    <span className="text-xxs text-red-400 font-normal">
                                                                        ({isAr ? "نفد" : "Sold out"})
                                                                    </span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 p-2 rounded-lg w-fit mx-auto md:mx-0">
                                                <Info size={14} className="text-gray-400" />
                                                <span className="font-cairo">{isAr ? "مكون ثابت بدون خيارات فرعية" : "Fixed component, no variant selection."}</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Column 3 — Sidebar live price & checkout card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 lg:sticky lg:top-32 space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 font-cairo border-b border-gray-100 pb-4">
                            {isAr ? "تفاصيل الدفع والتوفير" : "Offer Summary"}
                        </h3>

                        {/* Price Calculations */}
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm text-gray-500 font-cairo">
                                <span>{isAr ? "السعر الأصلي للمكونات" : "Original Items Total"}</span>
                                <span className="line-through">{t("{{price, currency}}", { price: bundle.original_total })}</span>
                            </div>

                            {bundle.discount > 0 && (
                                <div className="flex justify-between text-sm text-red-500 font-semibold font-cairo bg-red-50 p-2 rounded-lg items-center">
                                    <span className="flex items-center gap-1">
                                        <Percent size={14} />
                                        {isAr ? "خصم الباقة" : "Bundle Savings"}
                                    </span>
                                    <span>-{t("{{price, currency}}", { price: bundle.discount })}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-lg font-extrabold text-primary-950 font-cairo pt-2 border-t border-gray-100">
                                <span>{isAr ? "السعر النهائي للباقة" : "Final Bundle Price"}</span>
                                <span className="text-xl text-primary-900">{t("{{price, currency}}", { price: bundle.final_price })}</span>
                            </div>
                        </div>

                        {/* Selected configuration highlights summary */}
                        {Object.keys(selectionDetails).length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
                                <span className="block text-xxs font-bold uppercase tracking-wider text-gray-400 font-cairo mb-1">
                                    {isAr ? "خياراتك المحددة:" : "Selected Scents:"}
                                </span>
                                {bundle.items.map((item) => {
                                    if (!item.has_variants) return null;
                                    const selection = selectionDetails[item.product_id];
                                    return (
                                        <div key={item.id} className="text-xs flex justify-between font-cairo">
                                            <span className="text-gray-600 font-semibold">{item.product.name}:</span>
                                            <span className="text-primary-800 font-bold">{selection?.name || "..."}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Action buttons */}
                        <button
                            onClick={handleAddToCart}
                            disabled={bundle.stock <= 0}
                            className="w-full bg-primary-800 hover:bg-primary-900 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                            <ShoppingCart size={18} />
                            <span>{isAr ? "إضافة باقتي للسلة" : "Add Bundle to Cart"}</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
