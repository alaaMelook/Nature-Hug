"use client";

import React from "react";
import { ProductView } from "@/domain/entities/views/shop/productView";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Image from "next/image";
import { Percent, ArrowRight, ArrowLeft } from "lucide-react";

export function BundlesListScreen({ initBundles, lang }: { initBundles: ProductView[], lang: string }) {
    const router = useRouter();
    const { t } = useTranslation();
    const isAr = lang === 'ar';

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Premium Banner Header */}
                <div className="relative rounded-2xl overflow-hidden mb-12 shadow-xl bg-gradient-to-r from-primary-950 to-primary-800 text-white p-8 sm:p-12">
                    <div className="relative z-10 max-w-2xl">
                        <span className="bg-primary-500/20 text-primary-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                            {isAr ? "عروض حصرية لفترة محدودة" : "Limited Time Exclusive Offers"}
                        </span>
                        <h1 className="text-3xl sm:text-5xl font-extrabold font-cairo mb-4 leading-tight">
                            {isAr ? "باقات التوفير المميزة" : "Premium Value Bundles"}
                        </h1>
                        <p className="text-gray-250 text-sm sm:text-base mb-6 font-cairo">
                            {isAr 
                                ? "اختر باقتك المفضلة وخصص محتوياتها من العطور والأنواع التي تفضلها مع توفير إضافي يصل إلى 30%" 
                                : "Choose your favorite bundle and customize its scents and variants to your liking while saving up to 30%"}
                        </p>
                    </div>
                    {/* Abstract background shape */}
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-20 translate-y-20 pointer-events-none">
                        <div className="w-96 h-96 rounded-full bg-white blur-3xl"></div>
                    </div>
                </div>

                {/* Empty State */}
                {initBundles.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-md">
                        <p className="text-gray-500 text-lg mb-4 font-cairo">
                            {isAr ? "لا توجد باقات متوفرة حالياً. يرجى مراجعتنا لاحقاً!" : "No active bundles available right now. Please check back later!"}
                        </p>
                    </div>
                ) : (
                    /* Bundles Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {initBundles.map((bundle, idx) => {
                            const originalPrice = bundle.price;
                            const discount = bundle.discount || 0;
                            const finalPrice = originalPrice - discount;
                            const pct = originalPrice > 0 ? Math.round((discount / originalPrice) * 100) : 0;

                            return (
                                <motion.div
                                    key={bundle.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                                    className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    {/* Bundle Image Container */}
                                    <div className="relative aspect-video bg-gray-150">
                                        <Image
                                            src={bundle.image || "https://placehold.co/600x400/D1D5DB/4B5563?text=Bundle"}
                                            alt={bundle.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                        
                                        {/* Floating Discount Tag */}
                                        {pct > 0 && (
                                            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                                                <Percent size={12} />
                                                <span>{isAr ? `وفر ${pct}%` : `Save ${pct}%`}</span>
                                            </div>
                                        )}

                                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xs text-white text-xxs font-semibold px-2 py-0.5 rounded-sm">
                                            {bundle.category_name}
                                        </div>
                                    </div>

                                    {/* Content Card Body */}
                                    <div className="p-6 flex-grow flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold font-cairo text-primary-950 mb-2">
                                                {bundle.name}
                                            </h3>
                                            <p className="text-gray-600 text-xs line-clamp-3 mb-6 font-cairo">
                                                {bundle.description || (isAr ? "عرض توفير متكامل ومخصص." : "A complete customizable offer.")}
                                            </p>
                                        </div>

                                        {/* Price and Action Section */}
                                        <div className="border-t border-gray-100 pt-4 mt-auto">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className="block text-xxs uppercase tracking-wider text-gray-400">
                                                        {isAr ? "سعر الباقة" : "Bundle Price"}
                                                    </span>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-2xl font-extrabold text-primary-900">
                                                            {t("{{price, currency}}", { price: finalPrice })}
                                                        </span>
                                                        {discount > 0 && (
                                                            <span className="text-sm text-gray-400 line-through">
                                                                {t("{{price, currency}}", { price: originalPrice })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Stock Status */}
                                                <div>
                                                    {bundle.stock <= 0 ? (
                                                        <span className="text-xs text-red-500 font-semibold bg-red-50 px-2 py-1 rounded-sm">
                                                            {t("outOfStock")}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-sm">
                                                            {isAr ? "متوفر" : "In Stock"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    // Router pushes to the customization screen by cleaning raw slug
                                                    const cleanSlug = bundle.slug.replace('bundle-', '');
                                                    router.push(`/bundles/${cleanSlug}`);
                                                }}
                                                disabled={bundle.stock <= 0}
                                                className="w-full bg-primary-800 hover:bg-primary-900 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                                            >
                                                <span>{isAr ? "تخصيص واختيار الباقة" : "Customize & Configure"}</span>
                                                {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
