'use client';

import React, { useMemo, useState } from "react";
import BuyNowButton from "./BuyNowButton";
import AddToCartButton from "./CartButton";
import { useRouter } from "next/navigation";
import { ProductView } from "@/domain/entities/views/shop/productView";
import Skeleton from "@mui/material/Skeleton";
import { StarRating } from "./StarRating";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function ProductCard({
    product,
    compact = false,
}: {
    product: ProductView;
    compact?: boolean;
}) {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <motion.div
            variants={{
                show: {
                    opacity: 1,
                    transition: {
                        duration: 0.8,
                        ease: "easeInOut" as const
                    }
                },
                exit: {
                    opacity: 0,
                    transition: {
                        duration: 0.5,
                        ease: "easeInOut" as const
                    }
                }
            }}
            initial="hidden"
            animate="show"
            className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transform transition-transform duration-300 hover:scale-105 cursor-pointer z-2${compact ? "p-3" : ""
                }`}
            onClick={() => router.push(`/products/${product.slug}`)}
        >
            <div className={`relative ${compact ? "aspect-[4/3]" : "aspect-w-4 aspect-h-3"} block`}>
                <Image
                    src={product.image ?? "https://placehold.co/400x400/D1D5DB/4B5563?text=Image+Not+Found"}
                    alt={product.name || "Product image"}
                    className={`w-full object-cover align-middle ${compact ? "aspect-[4/3]" : "aspect-w-4 aspect-h-3"}`}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            "https://placehold.co/400x400/D1D5DB/4B5563?text=Image+Not+Found";
                    }}
                    quality={500}
                    width={compact ? 500 : 1000}
                    height={compact ? 500 : 1000}
                    priority={!compact}
                />

                {product.discount != null && product.discount > 0 && (
                    <div
                        className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                        {t("{{price, currency}}", { price: (product.discount * -1) })}
                    </div>
                )}

                {(product.stock == null || product.stock === 0) && (
                    <div
                        className="absolute top-3 right-3 bg-neutral-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                        {t("outOfStock")}
                    </div>
                )}
            </div>

            <div className={`p-${compact ? "3" : "5"} flex flex-col justify-between flex-grow`}>
                <div>
                    <div className="flex flex-col ">
                        <h3
                            className={`${compact ? "text-sm sm:text-md sm:mb-2" : "text-md sm:text-xl sm:mb-2"
                                } font-semibold text-gray-800`}
                        >
                            {product.name}
                        </h3>
                        <StarRating rating={product.avg_rating} />
                    </div>

                    <div className="flex items-center content-center mb-2">
                        {!product.discount ? (
                            <p className={`${compact ? "text-md sm:text-lg" : "text-sm sm:text-lg"} font-normal text-primary-900`}>
                                {t('{{price, currency}}', { price: product.price })}
                            </p>
                        ) : (
                            <div className="flex flex-col sm:flex-row sm:gap-5 items-baseline">
                                <p className={`${compact ? "text-lg" : "text-lg"} text-gray-500 line-through`}>
                                    {t('{{price, currency}}', { price: product.price })}
                                </p>
                                <p className={`${compact ? "text-md" : "text-md"} font-medium text-primary-900`}>
                                    {t('{{price, currency}}', { price: (product.price - product.discount) })}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                    {product.stock == 0 && (
                        <BuyNowButton product={product} quantity={1} className="invisible normalize_cursor z-1" />
                    )}
                    <AddToCartButton product={product} quantity={1} />
                    {product.stock > 0 && (
                        <BuyNowButton product={product} quantity={1} />
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function ProductGrid({
    products,
    isLoading,
    perPage = 6,
    recent = false,
}: Readonly<{
    isLoading: boolean;
    products?: ProductView[];
    perPage?: number;
    recent?: boolean;
}>) {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);

    // Reset page when filtered products change (fixes "freeze" issue)
    React.useEffect(() => {
        setPage(1);
    }, [products]);

    const totalPages = useMemo(() => {
        if (!products?.length) return 1;
        return Math.ceil(products.length / perPage);
    }, [products, perPage]);

    // 🔹 If 'recent' is on → show all, else paginate
    const visibleProducts = useMemo(() => {
        if (!products) return [];
        if (recent) return products;
        const start = (page - 1) * perPage;
        return products.slice(start, start + perPage);
    }, [products, page, perPage, recent]);

    const goToPage = (num: number) => {
        if (num >= 1 && num <= totalPages) setPage(num);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const skeletonAnimation = "wave";
    const variant = "rounded";

    return (
        <>
            {isLoading ? (
                <div className={`grid ${recent ? "grid-cols-2 sm:grid-cols-4 z-2" : "grid-cols-2 sm:grid-cols-3"} gap-6`}>
                    {[...Array(recent ? 4 : perPage)].map((_, i) => (
                        <Skeleton
                            key={i}
                            variant={variant}
                            width={"100%"}
                            height={"100%"}
                            animation={skeletonAnimation}
                            className={recent
                                ? "h-72 sm:h-80 md:h-96"
                                : "h-64 sm:h-72 md:h-80"}
                        />
                    ))}
                </div>
            ) : (products?.length ?? 0) > 0 ? (
                <>
                    <motion.div
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: {
                                    duration: 0.8,
                                    ease: "easeInOut" as const
                                }
                            },
                            exit: {
                                opacity: 0,
                                transition: {
                                    duration: 0.5,
                                    ease: "easeInOut" as const
                                }
                            }
                        }}
                        initial="hidden"
                        animate="show"
                        className={`grid ${recent
                            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                            : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3"
                            } gap-6`}
                    >
                        <AnimatePresence >
                            {visibleProducts.map((product) => (
                                <ProductCard key={product.slug} product={product} compact={!recent} />
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Pagination Controls — hidden when recent */}
                    {!recent && totalPages > 1 && (
                        <div className="flex justify-center items-center gap-3 mt-8">
                            <button
                                onClick={() => goToPage(page - 1)}
                                disabled={page === 1}
                                className={`px-4 py-2 rounded-lg border ${page === 1
                                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                    : "text-gray-700 hover:bg-gray-100 border-gray-300"
                                    }`}
                            >
                                {t("prev") || "Prev"}
                            </button>

                            {[...Array(totalPages)].map((_, i) => {
                                const pageNumber = i + 1;
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => goToPage(pageNumber)}
                                        className={`px-4 py-2 rounded-lg border ${page === pageNumber
                                            ? "bg-primary-600 text-white border-primary-600"
                                            : "text-gray-700 border-gray-300 hover:bg-gray-100"
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => goToPage(page + 1)}
                                disabled={page === totalPages}
                                className={`px-4 py-2 rounded-lg border ${page === totalPages
                                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                    : "text-gray-700 hover:bg-gray-100 border-gray-300"
                                    }`}
                            >
                                {t("next") || "Next"}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500 text-lg">{t("noProd")}</p>
                </div>
            )}
        </>
    );
}
