"use client"
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import ProductGrid from "@/ui/components/store/ProductsGrid";
import Link from "next/link";
import { ProductView } from "@/domain/entities/views/shop/productView";
import { useFeatures } from "@/ui/hooks/store/useFeatures";
import { motion } from "framer-motion";

export function HomeScreen({ initialProducts: products }: { initialProducts: ProductView[] }) {
    const { t } = useTranslation();
    const features = useFeatures();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <div className="min-h-screen antialiased text-gray-800">
            <main>
                {/* Hero Section */}
                <section className="bg-primary-50 py-12 md:py-20 lg:py-24 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
                    >
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl text-default leading-tight ">
                            {t("heroTitle")}
                        </h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="sm:text-lg text-primary-800 max-w-2xl mx-auto mb-8 mt-4"
                        >
                            {t("heroDescription")}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="flex flex-col sm:flex-row justify-center items-center gap-4"
                        >
                            <Link
                                href="/products"
                                className="bg-primary-800 w-1/2 sm:w-fit text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-primary-700 hover:scale-105 transition-all duration-300 text-center"
                            >
                                {t("shopNow")}
                            </Link>
                            <Link
                                href="/about-us"
                                className="font-semibold w-1/2 sm:w-fit px-6 py-3 rounded-lg shadow-md hover:bg-primary-50 hover:text-primary-800 hover:scale-105 transition-all duration-300 text-center text-primary-900 border border-primary-900"
                            >
                                {t("learnMore")}
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Product Grid Section */}
                <section className="py-12 md:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 max-h-fit">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-2xl md:text-3xl font-extrabold text-center mb-8 md:mb-12 text-default "
                        >
                            {t("featuredProducts")}
                        </motion.h2>

                        <ProductGrid products={products} isLoading={false} recent={true} />
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-primary-50 py-12 ">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid grid-cols-2 sm:grid-cols-2 gap-4 md:gap-8"
                        >
                            {features.map(
                                (feature: {
                                    title: string;
                                    icon: any;
                                    description: string;
                                }) => (
                                    <motion.div
                                        variants={itemVariants}
                                        key={feature.title}
                                        className="bg-white p-6 rounded-xl transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-primary text-center shadow-md"
                                    >
                                        <div className="flex justify-center mb-4">
                                            <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-[#8B4513]" />
                                        </div>

                                        <h3 className={` text-sm sm:text-lg text-default font-bold `}>{feature.title}</h3>
                                        <Trans components={{ b: <span className="font-semibold text-green-800" /> }}>
                                            <p className={`text-gray-800 text-xs sm:text-sm font-semibold mt-2`}>
                                                {feature.description}
                                            </p> </Trans>
                                    </motion.div>
                                )
                            )}
                        </motion.div>
                    </div>
                </section>
            </main>
        </div>
    );
}