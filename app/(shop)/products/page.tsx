'use client'
import React, { useMemo, useState } from "react";
import ProductGrid from "@/ui/(shop)/components/ProductsGrid";
import { useProductsData } from "@/ui/(shop)/hooks/useProductsData";
import ProductFilters from "@/ui/(shop)/components/ProductFilters";


export default function Products() {
  let { data: products, isLoading } = useProductsData({});
  const [filters, setFilters] = useState({ search: '', category: '', sortBy: 'name-asc', inStock: false, onSale: false });


  const handleFilterChange = (newFilters: any) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter(product => {
      const searchMatch = product.name.toLowerCase().includes(filters.search.toLowerCase());
      const categoryMatch = filters.category ? product.category_name === filters.category : true;
      const inStockMatch = filters.inStock ? product.stock != null && product.stock > 0 : true;
      const onSaleMatch = filters.onSale ? product.discount != null && product.discount > 0 : true;
      return searchMatch && categoryMatch && inStockMatch && onSaleMatch;
    });

    return filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return (a.price - (a.discount ?? 0)) - (b.price - (b.discount ?? 0));
        case 'price-desc':
          return (b.price - (b.discount ?? 0)) - (a.price - (a.discount ?? 0));
        case 'rating-desc':
          return (b.avg_rating || 0) - (a.avg_rating || 0);
        default:
          return 0;
      }
    });

  }, [products, filters]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Minimalist Centered Header */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Column */}
        <div className="lg:col-span-1">
          <ProductFilters onFilterChange={handleFilterChange} />
        </div>
        {/* Product Grid Column */}
        <div className="lg:col-span-3">
          <ProductGrid products={filteredProducts} isLoading={isLoading} perPage={5} />
        </div>
      </div>
    </div>


  );
}
