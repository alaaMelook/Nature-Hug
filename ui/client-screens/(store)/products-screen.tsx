"use client";
import {ProductView} from "@/domain/entities/views/shop/productView";
import {use, useEffect, useMemo, useState} from "react";
import ProductFilters from "@/ui/components/store/ProductFilters";
import ProductGrid from "@/ui/components/store/ProductsGrid";
import {useTranslation} from "@/ui/providers/TranslationProvider";
import {ViewAllProducts} from "@/domain/use-case/shop/viewAllProducts";
import {Category} from "@/domain/entities/database/category";

export function ProductsScreen({initProducts, initCategories}: {
    initProducts: Promise<ProductView[]>,
    initCategories: Promise<Category[]>
}) {
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        sortBy: 'name-asc',
        inStock: false,
        onSale: false
    });
    const [products, setProducts] = useState<ProductView[]>(use(initProducts));
    const [loading, setLoading] = useState(false);
    const {language} = useTranslation()

    useEffect(() => {
        async function refetch() {
            setLoading(true);
            const updated = await new ViewAllProducts().execute(true);
            setProducts(updated);
            setLoading(false);
        }

        refetch();
    }, [language]);
    const handleFilterChange = (newFilters: any) => {
        console.log(newFilters);
        setFilters(prevFilters => ({...prevFilters, ...newFilters}));
    };

    const filteredProducts = useMemo(() => {
        if (!products) return [];

        let filtered = products.filter(product => {
            const searchMatch = product.name.toLowerCase().includes(filters.search.toLowerCase());
            const categoryMatch = filters.category ? product.category_name?.toLowerCase() === filters.category.toLowerCase() : true;
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
            {/* Filters Column */}
            <div className="w-full lg:w-1/4 lg:sticky lg:top-8 h-fit">
                <ProductFilters onFilterChangeAction={handleFilterChange} initCategories={initCategories}/>
            </div>

            {/* Product Grid Column */}
            <div className="w-full lg:w-3/4">
                <ProductGrid products={filteredProducts} isLoading={loading} perPage={9}/>
            </div>
        </div>


    );
}

