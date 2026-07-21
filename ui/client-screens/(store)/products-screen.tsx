"use client";
import { ProductView } from "@/domain/entities/views/shop/productView";
import { useEffect, useMemo, useState } from "react";
import ProductFilters from "@/ui/components/store/ProductFilters";
import ProductGrid from "@/ui/components/store/ProductsGrid";
import { useTranslation } from "react-i18next";
import { Category } from "@/domain/entities/database/category";
import { motion } from "framer-motion";
import { trackViewItemList } from "@/lib/analytics/gtag";
import { useSearchParams } from "next/navigation";
import { Layers } from "lucide-react";

export function ProductsScreen({ initProducts, initCategories, hasBundles = false }: {
    initProducts: ProductView[],
    initCategories: Category[],
    hasBundles?: boolean,
}) {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category');
    const { i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    // Build categories list — inject virtual "Bundles" category when bundles exist
    const allCategories = useMemo(() => {
        if (!hasBundles) return initCategories;
        const bundlesCat: Category = {
            id: -999,
            name_en: 'Bundles',
            name_ar: 'الباقات',
            created_at: '',
            image_url: '',
        };
        return [bundlesCat, ...initCategories];
    }, [initCategories, hasBundles]);

    const [filters, setFilters] = useState({
        search: '',
        category: categoryParam || '',
        sortBy: 'default',
        inStock: false,
        onSale: false
    });
    const [products, setProducts] = useState<ProductView[]>(initProducts);
    const [loading, setLoading] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(6); // Default to mobile to prevent hydration mismatch if possible, or just standard.

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setItemsPerPage(9);
            } else {
                setItemsPerPage(6);
            }
        };

        // Set initial value
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleFilterChange = (newFilters: any) => {
        console.log(newFilters);
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    };

    const filteredProducts = useMemo(() => {
        if (!products) return [];

        let filtered = products.filter(product => {
            const searchMatch = product.name.toLowerCase().includes(filters.search.toLowerCase());

            // Category matching: check both category_names array and legacy category_name
            let categoryMatch = true;
            if (filters.category) {
                const filterCategoryLower = filters.category.toLowerCase();
                if (product.category_names && product.category_names.length > 0) {
                    categoryMatch = product.category_names.some(
                        catName => catName.toLowerCase() === filterCategoryLower
                    );
                } else {
                    categoryMatch = product.category_name?.toLowerCase() === filterCategoryLower;
                }
            }

            const inStockMatch = filters.inStock ? product.stock != null && product.stock > 0 : true;
            const onSaleMatch = filters.onSale ? product.discount != null && product.discount > 0 : true;
            return searchMatch && categoryMatch && inStockMatch && onSaleMatch;
        });

        // Sort: Products with offers/discounts first, then by selected criteria
        return filtered.sort((a, b) => {
            // First priority: Products with discount come first
            const aHasDiscount = a.discount != null && a.discount > 0;
            const bHasDiscount = b.discount != null && b.discount > 0;

            if (aHasDiscount && !bHasDiscount) return -1;
            if (!aHasDiscount && bHasDiscount) return 1;

            // Second priority: Apply selected sort criteria
            switch (filters.sortBy) {
                case 'default':
                    return 0; // Keep API order (sort_order from admin)
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

    // GA4 Track View Item List
    useEffect(() => {
        if (filteredProducts.length > 0) {
            const listName = filters.category || "All Products";
            trackViewItemList(
                listName,
                filteredProducts.slice(0, 10).map(p => ({
                    item_id: p.id || p.slug,
                    item_name: p.name,
                    price: p.price,
                    item_category: p.category_name || undefined
                }))
            );
        }
    }, [filteredProducts, filters.category]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row sm:gap-8 min-h-screen"
        >
            {/* Filters Column */}
            <div className="w-full lg:w-1/4 lg:sticky lg:top-40 h-fit">
                <ProductFilters onFilterChangeAction={handleFilterChange} initCategories={allCategories} currentFilters={filters} />
            </div>

            {/* Product Grid Column */}
            <div className="w-full lg:w-3/4">
                {/* Bundles quick-filter chip — shows when hasBundles and no category selected */}
                {hasBundles && !filters.category && (
                    <button
                        onClick={() => handleFilterChange({ category: 'Bundles' })}
                        className="mb-4 flex items-center gap-2 text-xs font-semibold bg-primary-50 border border-primary-200 text-primary-800 px-4 py-2 rounded-full hover:bg-primary-100 transition-all"
                    >
                        <Layers size={13} />
                        {isAr ? 'عرض الباقات فقط' : 'Show Bundles Only'}
                    </button>
                )}
                <ProductGrid products={filteredProducts} isLoading={loading} perPage={itemsPerPage} />
            </div>
        </motion.div>
    );
}

