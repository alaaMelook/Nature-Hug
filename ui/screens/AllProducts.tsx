"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/data/supabase/client";
import { ProductView } from "@/domain/entities/views/shop/productView";
import ProductGrid from "../components/(shop)/ProductsGrid";



export default function ProductsPage({
    initialProducts,
}: Readonly<{
    initialProducts: ProductView[];
}>) {

    return (
        <div className="p-8 sm:p-12 bg-primary-50 min-h-screen font-sans">
            {/* Minimalist Centered Header */}
            <div className="text-center mb-16">
                <h1 className="text-5xl font-extralight text-gray-900">All Products</h1>
                <p className="mt-4 max-w-2xl mx-auto text-gray-600 text-lg">Pure ingredients for visible results. Discover your new daily ritual.</p>
            </div>

            <ProductGrid products={initialProducts} />
        </div>
    );
}