"use client"
import Image from "next/image";
import { Trans, useTranslation } from "react-i18next";
import ProductGrid from "@/ui/components/store/ProductsGrid";
import Link from "next/link";
import { ProductView } from "@/domain/entities/views/shop/productView";
import { useFeatures } from "@/ui/hooks/store/useFeatures";
import { motion } from "framer-motion";
import { Category } from "@/domain/entities/database/category";


export function HomeScreen({ initialProducts: products, categories }: { initialProducts: ProductView[], categories: Category[] }) {
    const { t, i18n } = useTranslation();
    const features = useFeatures();
    const visibleCategories = categories.filter(c => c.image_url);
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
        <div className="min-h-screen antialiased bg-primary-50 text-gray-800">
            <div className="absolute top-0 left-0 w-full overflow-hidden z-1 opacity-35 h-[150vh]">

                {/* --- Sphere 1: Top-Left Start (Deep Blue) --- */}
                <motion.div
                    animate={{
                        // Drifts from top-left toward bottom-right, then reverses
                        x: [0, 800, 0],
                        y: [0, 600, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 13, // Slow, but noticeable over the long path
                        ease: "easeInOut", // Smooth start/stop
                        repeat: Infinity,
                        repeatType: "reverse",
                    }}
                >
                    {/* Placed off-screen to start */}
                    <div className="absolute -top-[10rem] -left-[10rem] w-[50rem] h-[50rem] rounded-full bg-primary-600 blur-[80px] opacity-90"></div>
                </motion.div>

                {/* --- Sphere 2: Bottom-Right Start (Soft Pink) --- */}
                <motion.div
                    animate={{
                        // Drifts from bottom-right toward top-left, then reverses
                        x: [0, -700, 0],
                        y: [0, -500, 0],
                        scale: [1, 0.9, 1],
                    }}
                    transition={{
                        duration: 10,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: 10 // Staggered start
                    }}
                >
                    {/* Placed off-screen to start */}
                    <div className="absolute bottom-[5rem] right-[5rem] w-[45rem] h-[45rem] rounded-full bg-primary-700 blur-[120px] opacity-85"></div>
                </motion.div>

                {/* --- Sphere 3: Top-Right Start (Cyan) --- */}
                <motion.div
                    animate={{
                        // Drifts across the horizontal space
                        x: [0, -900, 0],
                        y: [0, 100, 0], // Slight vertical movement
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 13,
                        ease: "linear",
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: 2 // Staggered start
                    }}
                >
                    {/* Placed off-screen to start */}
                    <div className="absolute -top-[5rem] right-[10rem] w-[40rem] h-[40rem] rounded-full bg-primary-500 blur-[80px] opacity-80"></div>
                </motion.div>

                {/* --- Sphere 4: Bottom-Left Start (Purple) --- */}
                <motion.div
                    animate={{
                        // Drifts across the vertical space
                        x: [0, 100, 0], // Slight horizontal movement
                        y: [0, -700, 0],
                        scale: [1, 0.95, 1.05, 1],
                    }}
                    transition={{
                        duration: 15, // Slowest drift
                        ease: "linear",
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: 7 // Staggered start
                    }}
                >
                    {/* Placed off-screen to start */}
                    <div className="absolute bottom-[10rem] -left-[5rem] w-[35rem] h-[35rem] rounded-full bg-primary-600 blur-[50px] opacity-75"></div>
                </motion.div>
                <div className="absolute bottom-0 left-0 w-full h-1/4 z-10 
                                    bg-gradient-to-t from-primary-50 via-primary-50/50 to-transparent">
                </div>
            </div>
            <main className="z-2">
                {/* Enhanced Hero Section */}

                <section className="flex flex-col items-center justify-center py-20 md:py-32 overflow-hidden h-screen">
                    {/* Background decoration */}

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className=" relative z-3 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center "
                    >
                        <h1 className={`text-4xl sm:text-5xl lg:text-7xl font-bold text-primary-900 leading-tight mb-6 font-${i18n.language === "ar" ? "arabic" : "serif"}`}>
                            {t("heroTitle")}
                        </h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="text-lg sm:text-xl text-primary-800 max-w-2xl mx-auto mb-10 leading-relaxed"
                        >
                            {t("heroDescription")}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
                            className="flex flex-col sm:flex-row justify-center items-center gap-4"
                        >
                            <Link
                                href="/products"
                                className="bg-primary-900 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-primary-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center min-w-[160px]"
                            >
                                {t("shopNow")}
                            </Link>
                            <Link
                                href="/about-us"
                                className="bg-white text-primary-900 font-semibold px-8 py-4 rounded-full shadow-md hover:bg-gray-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center border border-gray-200 min-w-[160px]"
                            >
                                {t("learnMore")}
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>
                <section className={`py-16  mt-6 mb-2  z-2`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 max-h-fit">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="z-2 text-center text-3xl md:text-4xl font-serif font-bold mb-22 text-primary-900 text-shadow-black"
                        >
                            {t("featuredProducts")}
                        </motion.h2>

                        <ProductGrid products={products} isLoading={false} recent={true} />

                        <div className="mt-12 text-end">
                            <Link
                                href="/products"
                                className="inline-block  justify-end items-end self-end border-b-2 border-primary-900 text-primary-900 font-semibold pb-1 hover:text-primary-700 hover:border-primary-700 transition-colors"
                            >
                                {t("viewAllProducts")}
                            </Link>
                        </div>
                    </div>
                </section>
                {/* Shop by Category Section */}
                {visibleCategories.length > 0 && (
                    <section className="py-16 h-full bg-gradient-to-b from-primary-50 to-white ">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-2">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="text-center text-3xl md:text-4xl font-serif font-bold mt-5 mb-22 text-primary-950 z-2 text-shadow-black"
                            >
                                {t("shopByCategory")}
                            </motion.h2>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {visibleCategories?.map((category) => {
                                    return (
                                        <Link
                                            key={category.id}
                                            href={`/products?category=${encodeURIComponent(category.name_en)}`}
                                            className="group relative overflow-hidden rounded-2xl shadow-md aspect-[4/5] cursor-pointer"
                                        >
                                            <Image
                                                src={category.image_url}
                                                alt={category.name_en}
                                                fill={true}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300">
                                                <div className="absolute bottom-0 left-0 w-full p-6 text-center ">
                                                    <h3 className="text-white text-xl font-bold tracking-wide group-hover:text-primary-100 transition-colors">
                                                        {i18n.language === "ar" ? category.name_ar ?? category.name_en : category.name_en}
                                                    </h3>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </section>
                )}
                {/* Product Grid Section */}


                {/* Features Section */}
                <section className={`bg-gradient-to-b from-white to-primary-50 py-25`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 "
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
                                        className="flex flex-col items-center text-center p-6 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                                    >
                                        <div className="mb-4 p-3 bg-primary-100 rounded-full text-primary-800">
                                            <feature.icon className="w-8 h-8" />
                                        </div>

                                        <h3 className="cursor-default text-lg font-bold text-primary-900 mb-2">{feature.title}</h3>
                                        <p className="cursor-default text-gray-600 text-sm leading-relaxed">
                                            <Trans components={{ b: <strong /> }}>
                                                {feature.description}
                                            </Trans>
                                        </p>
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