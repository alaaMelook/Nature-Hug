'use client'
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { viewAllProducts } from "@/domain/use-case/shop/viewAllProducts";
import ProductGrid from "@/ui/components/(shop)/ProductsGrid";


export default function Products() {
  let {
    data: products,

    isLoading } = useQuery({
      queryKey: ["products"],
      queryFn: () => viewAllProducts(),
    });



  return (
    <div className="p-8 sm:p-12 bg-primary-50 min-h-screen font-sans">
      {/* Minimalist Centered Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extralight text-gray-900">All Products</h1>
        <p className="mt-4 max-w-2xl mx-auto text-gray-600 text-lg">Pure ingredients for visible results. Discover your new daily ritual.</p>
      </div>

      <ProductGrid products={products} isLoading={isLoading} />
    </div>
  );
}
