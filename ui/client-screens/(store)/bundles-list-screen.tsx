"use client";

import React from "react";
import { ProductView } from "@/domain/entities/views/shop/productView";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Image from "next/image";
import { Percent } from "lucide-react";

export function BundlesListScreen({ initBundles, lang }: { initBundles: ProductView[], lang: string }) {
    const router = useRouter();
    const { t } = useTranslation();
    const isAr = lang === 'ar';

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Premium Banner Header */}
                <div className="relative rounded-2xl overflow-hidden mb-12 shadow-lg bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 text-white p-8 sm:p-12">
                    <div className="relative z-10 max-w-2xl">
                        <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                            {isAr ? "عروض حصرية لفترة محدودة" : "Limited Time Exclusive Offers"}
                        </span>
                        <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
                            {isAr ? "باقات التوفير المميزة" : "Premium Value Bundles"}
                        </h1>
                        <p className="text-white/90 text-sm sm:text-base mb-6">
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

                {/* Bundles Grid */}
                {initBundles.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-md">
                        <p className="text-gray-500 text-lg mb-4">
                            {isAr ? "لا توجد باقات متوفرة حالياً. يرجى مراجعتنا لاحقاً!" : "No active bundles available right now. Please check back later!"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                    className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col border border-primary-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    {/* Bundle Image Container */}
                                    <div className="relative aspect-[4/3] bg-primary-50">
                                        <Image
                                            src={bundle.image || "https://placehold.co/600x450/D1D5DB/4B5563?text=Bundle"}
                                            alt={bundle.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                        
                                        {/* Floating Discount Tag */}
                                        {pct > 0 && (
                                            <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                                                <Percent size={14} />
                                                <span>{isAr ? `وفر ${pct}%` : `Save ${pct}%`}</span>
                                            </div>
                                        )}

                                        <div className="absolute bottom-4 right-4 bg-primary-800/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                                            {bundle.category_name}
                                        </div>
                                    </div>

                                    {/* Content Card Body */}
                                    <div className="p-7 flex-grow flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                                {bundle.name}
                                            </h3>
                                            <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                                                {bundle.description || (isAr ? "عرض توفير متكامل ومخصص." : "A complete customizable offer.")}
                                            </p>
                                        </div>

                                        {/* Price and Action Section */}
                                        <div className="border-t border-primary-100 pt-5 mt-auto">
                                            <div className="flex items-center justify-between mb-5">
                                                <div>
                                                    <span className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                                                        {isAr ? "سعر الباقة" : "Bundle Price"}
                                                    </span>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-3xl font-extrabold text-primary-800">
                                                            {t("{{price, currency}}", { price: finalPrice })}
                                                        </span>
                                                        {discount > 0 && (
                                                            <span className="text-base text-gray-400 line-through">
                                                                {t("{{price, currency}}", { price: originalPrice })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Stock Status */}
                                                <div>
                                                    {bundle.stock <= 0 ? (
                                                        <span className="text-sm text-red-500 font-semibold bg-red-50 px-3 py-1.5 rounded-lg">
                                                            {t("outOfStock")}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-lg">
                                                            {isAr ? "متوفر" : "In Stock"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    const cleanSlug = bundle.slug.replace('bundle-', '');
                                                    router.push(`/bundles/${cleanSlug}`);
                                                }}
                                                disabled={bundle.stock <= 0}
                                                className="w-full py-3.5 rounded-lg shadow-md flex items-center justify-center transition-colors duration-300 text-sm font-semibold bg-primary-700 text-primary-50 hover:bg-primary-200 hover:text-primary-700 cursor-pointer disabled:bg-gray-400 disabled:text-gray-200"
                                            >
                                                <span>{isAr ? "تخصيص واختيار الباقة" : "Customize & Configure"}</span>
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
