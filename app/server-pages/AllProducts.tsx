"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import ProductView from "../components/ProductsView";


export default function ProductsPage({
    initialProducts,
}: Readonly<{
    initialProducts: Product[];
}>) {

    const supabase = createSupabaseBrowserClient();
    const [products, setProducts] = useState<Product[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);



    useEffect(() => {

        const fetchProducts = async () => {

            try {

                setLoading(true);

                const { data, error } = await supabase

                    .from("products")

                    .select("*");



                if (error) {

                    setError(error.message);

                    console.error("Supabase error:", error);

                    return;

                }



                setProducts(data || []);

            } catch (err) {

                setError("Failed to fetch products");

                console.error("Fetch error:", err);

            } finally {

                setLoading(false);

            }

        };



        fetchProducts();

    }, []);



    return (
        <div className="p-8 sm:p-12 bg-primary-50 min-h-screen font-sans">
            {/* Minimalist Centered Header */}
            <div className="text-center mb-16">
                <h1 className="text-5xl font-extralight text-gray-900">All Products</h1>
                <p className="mt-4 max-w-2xl mx-auto text-gray-600 text-lg">Pure ingredients for visible results. Discover your new daily ritual.</p>
            </div>

            <ProductView loading={loading} error={error} products={products} />
        </div>
    );
}