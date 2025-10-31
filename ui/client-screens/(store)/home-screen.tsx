"use client"
import React, {useEffect, useState} from "react";
import {useFeatures, useTranslation} from "@/ui/providers/TranslationProvider";
import ProductGrid from "@/ui/components/store/ProductsGrid";
import Link from "next/link";
import {ProductView} from "@/domain/entities/views/shop/productView";
import {GetProductsData} from "@/ui/hooks/store/useProductsData";

export function HomeScreen({initialProducts}: { initialProducts: ProductView[] }) {
    const {t, language} = useTranslation();
    const features = useFeatures();
    const [products, setProducts] = useState(initialProducts);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        async function refetch() {
            setLoading(true);
            const updated = await new GetProductsData().recent();
            setProducts(updated);
            setLoading(false);
        }

        refetch();
    }, [language]);
    return (
        <div className="min-h-screen bg-gray-50 antialiased text-gray-800">
            <main>
                {/* Hero Section */}
                <section className="bg-primary-100 py-12 md:py-20 lg:py-24">
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
                                className="bg-primary-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-primary-50 hover:text-primary-700 transition-colors duration-300 text-center"
                            >
                                {t("shopNow")}
                            </Link>
                            <Link
                                href="#"
                                className="bg-primary-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-primary-50 hover:text-primary-700  transition-colors duration-300 text-center"
                            >
                                {t("learnMore")}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Product Grid Section */}
                <section className="bg-primary-50 py-12 md:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-h-fit">
                        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-default ">
                            {t("featuredProducts")}
                        </h2>

                        <ProductGrid products={products} isLoading={loading}/>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-primary-100 py-12 md:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
                                            <feature.icon className="w-10 h-10 text-[#8B4513]"/>
                                        </div>
                                        <h3 className={`text-lg text-default `}>{feature.title}</h3>
                                        <p className={`text-gray-800 text-sm`}>
                                            {feature.description}
                                        </p>
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