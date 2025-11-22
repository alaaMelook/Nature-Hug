"use client"
import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import ProductGrid from "@/ui/components/store/ProductsGrid";
import Link from "next/link";
import { ProductView } from "@/domain/entities/views/shop/productView";
import { GetProductsData } from "@/ui/hooks/store/useProductsData";
import { useFeatures } from "@/ui/hooks/store/useFeatures";
import { useCurrentLanguage } from "@/ui/hooks/useCurrentLanguage";

export function HomeScreen({ initialProducts: products }: { initialProducts: ProductView[] }) {
    const { t } = useTranslation();
    const features = useFeatures();
    return (
        <div className="min-h-screen  antialiased text-gray-800">
            <main>
                {/* Hero Section */}
                <section className="bg-primary-50 py-12 md:py-20 lg:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl text-default leading-tight ">
                            {t("heroTitle")}
                        </h1>
                        <p className="sm:text-lg text-primary-800 max-w-2xl mx-auto mb-8">
                            {t("heroDescription")}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <Link
                                href="/products"
                                className="bg-primary-800 w-1/2 sm:w-fit text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-primary-50 hover:text-primary-700 transition-colors duration-300 text-center"
                            >
                                {t("shopNow")}
                            </Link>
                            <Link
                                href="/about-us"
                                className=" font-semibold w-1/2 sm:w-fit px-6 py-3 rounded-lg shadow-md hover:bg-primary-50 hover:text-primary-700  transition-colors duration-300 text-center  text-primary-900 border-1 border-primary-900"
                            >
                                {t("learnMore")}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Product Grid Section */}
                <section className="py-12 md:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6max-h-fit">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-8 md:mb-12 text-default ">
                            {t("featuredProducts")}
                        </h2>

                        <ProductGrid products={products} isLoading={false} recent={true} />
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-primary-50 py-12 ">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                            {features.map(
                                (feature: {
                                    title: string;
                                    icon: any;
                                    description: string;
                                }) => (
                                    <div
                                        key={feature.title}
                                        className="bg-white p-6 rounded-xl transform transition-transform duration-300 hover:scale-105 text-primary  text-center shadow-md"
                                    >
                                        <div className="flex justify-center mb-4">
                                            <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-[#8B4513]" />
                                        </div>

                                        <h3 className={` text-sm sm:text-lg text-default font-bold `}>{feature.title}</h3>
                                        <Trans components={{ b: <span className="font-semibold text-green-800" /> }}>
                                            <p className={`text-gray-800 text-xs sm:text-sm font-semibold mt-2`}>
                                                {feature.description}
                                            </p> </Trans>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </section>
            </main>


        </div>
    );
}