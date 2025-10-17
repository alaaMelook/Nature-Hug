'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductView } from '@/domain/entities/views/shop/productView';
import { Category } from '@/domain/entities/database/category';
import { viewAllProducts } from '@/domain/use-case/shop/viewAllProducts';
import { getAllCategories } from '@/domain/use-case/shop/getAllCategories';

export function useProducts() {
    const [filters, setFilters] = useState({ search: '', category: '', sortBy: 'name-asc', inStock: false, onSale: false });

    const { data: products, isLoading: productsLoading, error: productsError } = useQuery<ProductView[], Error>({
        queryKey: ['products'],
        queryFn: viewAllProducts,
    });

    const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery<Category[], Error>({
        queryKey: ['categories'],
        queryFn: getAllCategories,
    });

    const handleFilterChange = (newFilters: any) => {
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    };

    const filteredProducts = useMemo(() => {
        if (!products) return [];

        let filtered = products.filter(product => {
            const searchMatch = product.name.toLowerCase().includes(filters.search.toLowerCase());
            const categoryMatch = filters.category ? product.category_id === parseInt(filters.category) : true;
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
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'rating-desc':
                    return (b.avg_rating || 0) - (a.avg_rating || 0);
                default:
                    return 0;
            }
        });

    }, [products, filters]);

    return {
        products: filteredProducts,
        categories: categories || [],
        isLoading: productsLoading || categoriesLoading,
        error: productsError || categoriesError,
        filters,
        handleFilterChange,
    };
}
