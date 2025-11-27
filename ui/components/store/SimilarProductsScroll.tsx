'use client';

import React, { useRef } from "react";
import { ProductView } from "@/domain/entities/views/shop/productView";
import { ProductCard } from "./ProductsGrid";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SimilarProductsScroll({
    products,
}: {
    products: ProductView[];
}) {
    const { t } = useTranslation();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            // Calculate scroll amount: 4 items * (width of item + gap)
            // Item width is w-64 (16rem = 256px) or sm:w-72 (18rem = 288px)
            // Gap is 4 (1rem = 16px)
            // We'll approximate or measure. Let's use a safe estimate or dynamic measurement if possible.
            // For simplicity, let's assume sm:w-72 (288px) + gap-4 (16px) = 304px * 4 = 1216px
            const scrollAmount = 304 * 4;

            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className="relative group ">
            {/* Left Arrow */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-primary-900 p-2 rounded-full shadow-md hidden md:flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 -ml-4"
                aria-label="Scroll left"
            >
                <ChevronLeft size={24} />
            </button>

            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                className="w-full overflow-x-scroll px-4 scrollbar-hide scroll-smooth "
            >
                <div className="flex gap-4 min-w-max py-5">
                    {products.map((product, index) => (
                        <div key={product.slug + index} className="w-64 sm:w-72">
                            <ProductCard product={product} compact={true} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Arrow */}
            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-primary-900 p-2 rounded-full shadow-md hidden md:flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 -mr-4"
                aria-label="Scroll right"
            >
                <ChevronRight size={24} />
            </button>
        </div>
    );
}
