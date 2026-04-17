'use client';
import { useState, useRef, useEffect, useMemo } from "react";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { Search, Plus, Filter, Trash2, Package, PlusCircle, X, Check, ChevronDown, ChevronRight, Pencil, Eye, EyeOff, Layers, Box, ArrowUpDown } from "lucide-react";
import { deleteProduct, toggleProductVisibilityAction } from "@/ui/hooks/admin/products";
import { toast } from "sonner";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Material } from "@/domain/entities/database/material";
import { useRouter } from "next/navigation";
import { StockUpdateModal } from "@/ui/components/admin/stockUpdateModal";
import { addStockAction } from "@/ui/hooks/admin/inventory";
import { motion, AnimatePresence } from "framer-motion";

export function ProductsScreen({ products, materials }: { products: ProductAdminView[], materials: Material[] }) {
    const { t, i18n } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductAdminView | null>(null);
    const router = useRouter();

    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [filterStock, setFilterStock] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
    const [filterType, setFilterType] = useState<'all' | 'with_variants' | 'simple'>('all');
    const filterRef = useRef<HTMLDivElement>(null);

    // Expanded products state (for showing variants)
    const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());

    const toggleExpand = (productId: number) => {
        setExpandedProducts(prev => {
            const next = new Set(prev);
            if (next.has(productId)) {
                next.delete(productId);
            } else {
                next.add(productId);
            }
            return next;
        });
    };

    const expandAll = () => {
        const allWithVariants = products
            .filter(p => p.variants && p.variants.length > 0)
            .map(p => p.product_id);
        setExpandedProducts(new Set(allWithVariants));
    };

    const collapseAll = () => {
        setExpandedProducts(new Set());
    };

    // Close filter dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Helper to get category names from categories array
    const getCategoryNames = (product: ProductAdminView): string => {
        if (!product.categories || product.categories.length === 0) return '';
        return product.categories
            .map(c => i18n.language === 'ar' ? (c.name_ar ?? c.name_en) : c.name_en)
            .filter(Boolean)
            .join(', ');
    };

    // Extract unique categories for filter
    const uniqueCategories = Array.from(new Set(
        products.flatMap(p =>
            (p.categories || []).map(c =>
                i18n.language === 'ar' ? (c.name_ar ?? c.name_en) : c.name_en
            )
        )
    )).filter(Boolean) as string[];

    // Stats
    const stats = useMemo(() => {
        const total = products.length;
        const withVariants = products.filter(p => p.variants && p.variants.length > 0).length;
        const totalVariants = products.reduce((sum, p) => sum + (p.variants?.length || 0), 0);
        const outOfStock = products.filter(p => {
            if (p.variants && p.variants.length > 0) {
                return p.variants.every(v => v.stock === 0);
            }
            return p.stock === 0;
        }).length;
        return { total, withVariants, totalVariants, outOfStock };
    }, [products]);

    const filteredProducts = (products || []).filter((product) => {
        // 1. Search Filter - also search in variant names
        const matchesProductSearch = product.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.name_ar.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesVariantSearch = (product.variants || []).some(v =>
            v.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.name_ar.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesSearch = matchesProductSearch || matchesVariantSearch;

        // 2. Category Filter
        const productCategories = (product.categories || []).map(c =>
            i18n.language === 'ar' ? (c.name_ar ?? c.name_en) : c.name_en
        );
        const matchesCategory = filterCategory ? productCategories.includes(filterCategory) : true;

        // 3. Stock Filter
        let matchesStock = true;
        const effectiveStock = product.variants && product.variants.length > 0
            ? product.variants.reduce((sum, v) => sum + v.stock, 0)
            : product.stock;
        if (filterStock === 'in_stock') matchesStock = effectiveStock > 0;
        if (filterStock === 'out_of_stock') matchesStock = effectiveStock === 0;
        if (filterStock === 'low_stock') matchesStock = effectiveStock > 0 && effectiveStock <= 10;

        // 4. Type Filter
        let matchesType = true;
        if (filterType === 'with_variants') matchesType = (product.variants?.length || 0) > 0;
        if (filterType === 'simple') matchesType = !product.variants || product.variants.length === 0;

        return matchesSearch && matchesCategory && matchesStock && matchesType;
    });

    const handleDelete = async (product: ProductAdminView) => {
        if (confirm(t("confirmDeleteProduct"))) {
            const result = await deleteProduct(product);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success(t("productDeletedSuccessfully") || "Product deleted successfully");
                router.refresh();
            }
        }
    };

    const handleOpenStockModal = (product: ProductAdminView) => {
        setSelectedProduct(product);
        setIsStockModalOpen(true);
    };

    const handleAddStock = async (quantity: number,) => {
        if (!selectedProduct) return;

        const result = await addStockAction('product', selectedProduct, quantity);

        if (result.success) {
            toast.success(t("stockAdded") || "Stock added successfully");
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const handleVisibilityToggle = async (product: ProductAdminView) => {
        const isVariant = !!product.variant_id;
        const id = isVariant ? product.variant_id! : product.product_id;
        const newVisibility = !product.visible;

        const result = await toggleProductVisibilityAction(id, isVariant, newVisibility);

        if (result.success) {
            toast.success(t("visibilityUpdated") || "Visibility updated");
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const clearFilters = () => {
        setFilterCategory(null);
        setFilterStock('all');
        setFilterType('all');
        setSearchTerm("");
        setIsFilterOpen(false);
    };

    const activeFiltersCount = (filterCategory ? 1 : 0) + (filterStock !== 'all' ? 1 : 0) + (filterType !== 'all' ? 1 : 0);

    // Helper to get stock badge
    const getStockBadge = (stock: number) => {
        if (stock === 0) return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: t("outOfStock") };
        if (stock <= 10) return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: `${stock} ${t("leftInStock")}` };
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: `${stock} ${t("leftInStock")}` };
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t("products")}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t("manageInventory")}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => {
                            router.push("/admin/products/order");
                        }}
                        className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
                    >
                        <ArrowUpDown className="w-4 h-4 mx-1" />
                        {i18n.language === 'ar' ? 'ترتيب' : 'Reorder'}
                    </button>
                    <button
                        onClick={() => {
                            router.push("/admin/products/create");
                        }}
                        className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-100 transition-all flex-1 sm:flex-none"
                    >
                        <Plus className="w-4 h-4 mx-2" />
                        {t("addProduct")}
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                        <p className="text-[11px] text-gray-500">{t("products") || "Products"}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Layers className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-900">{stats.withVariants}</p>
                        <p className="text-[11px] text-gray-500">{i18n.language === 'ar' ? 'بها أنواع' : 'With Variants'}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Box className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-900">{stats.totalVariants}</p>
                        <p className="text-[11px] text-gray-500">{i18n.language === 'ar' ? 'إجمالي الأنواع' : 'Total Variants'}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                        <Package className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-900">{stats.outOfStock}</p>
                        <p className="text-[11px] text-gray-500">{t("outOfStock")}</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center z-20 relative">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t("searchProducts")}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Expand/Collapse toggles */}
                    <button
                        onClick={expandAll}
                        className="hidden sm:flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        title={i18n.language === 'ar' ? 'توسيع الكل' : 'Expand All'}
                    >
                        <ChevronDown className="w-3 h-3" />
                        {i18n.language === 'ar' ? 'توسيع' : 'Expand'}
                    </button>
                    <button
                        onClick={collapseAll}
                        className="hidden sm:flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        title={i18n.language === 'ar' ? 'طي الكل' : 'Collapse All'}
                    >
                        <ChevronRight className="w-3 h-3" />
                        {i18n.language === 'ar' ? 'طي' : 'Collapse'}
                    </button>

                    {/* Filter */}
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center justify-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors w-full sm:w-auto ${isFilterOpen || activeFiltersCount > 0 ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Filter className="w-4 h-4 mx-2" />
                            {t("filter")}
                            {activeFiltersCount > 0 && (
                                <span className="ml-2 bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                            <ChevronDown className={`w-3 h-3 ml-2 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.1 }}
                                    className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50 origin-top-right"
                                >
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                            <h3 className="font-semibold text-gray-900 text-sm">{t("filters")}</h3>
                                            {(filterCategory || filterStock !== 'all' || filterType !== 'all') && (
                                                <button
                                                    onClick={clearFilters}
                                                    className="text-xs text-red-500 hover:text-red-600 flex items-center"
                                                >
                                                    <X className="w-3 h-3 mr-1" />
                                                    {t("clearAll")}
                                                </button>
                                            )}
                                        </div>

                                        {/* Product Type Filter */}
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">{i18n.language === 'ar' ? 'النوع' : 'Type'}</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { id: 'all', label: t("all") },
                                                    { id: 'with_variants', label: i18n.language === 'ar' ? 'بأنواع' : 'Variants' },
                                                    { id: 'simple', label: i18n.language === 'ar' ? 'بسيط' : 'Simple' }
                                                ].map((option) => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => setFilterType(option.id as any)}
                                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-center border ${filterType === option.id
                                                            ? 'bg-primary-50 border-primary-200 text-primary-700'
                                                            : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Stock Filter */}
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">{t("stockStatus")}</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { id: 'all', label: t("all") },
                                                    { id: 'in_stock', label: t("inStock") },
                                                    { id: 'low_stock', label: t("lowStock") },
                                                    { id: 'out_of_stock', label: t("outOfStock") }
                                                ].map((option) => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => setFilterStock(option.id as any)}
                                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-center border ${filterStock === option.id
                                                            ? 'bg-primary-50 border-primary-200 text-primary-700'
                                                            : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Category Filter */}
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">{t("category")}</label>
                                            <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                                                <button
                                                    onClick={() => setFilterCategory(null)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${filterCategory === null ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span>{t("allCategories")}</span>
                                                    {filterCategory === null && <Check className="w-3 h-3" />}
                                                </button>
                                                {uniqueCategories.map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setFilterCategory(cat)}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${filterCategory === cat ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <span>{cat}</span>
                                                        {filterCategory === cat && <Check className="w-3 h-3" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Product List */}
            <div className="relative z-0">
                {/* Desktop View */}
                <div className="hidden md:block space-y-3">
                    <AnimatePresence>
                        {filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-10 text-center text-gray-500">
                                {t("noProductsFound")}
                                {(filterCategory || filterStock !== 'all' || filterType !== 'all' || searchTerm) && (
                                    <button
                                        onClick={clearFilters}
                                        className="block mx-auto mt-2 text-primary-600 text-sm hover:underline"
                                    >
                                        {t("clearAllFilters")}
                                    </button>
                                )}
                            </div>
                        ) : filteredProducts.map((product) => {
                            const hasVariants = product.variants && product.variants.length > 0;
                            const isExpanded = expandedProducts.has(product.product_id);
                            const totalVariantStock = hasVariants
                                ? product.variants.reduce((sum, v) => sum + v.stock, 0)
                                : product.stock;
                            const stockInfo = getStockBadge(totalVariantStock);

                            return (
                                <motion.div
                                    key={product.slug}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    layout
                                    className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-200 ${hasVariants && isExpanded ? 'border-purple-200 ring-1 ring-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    {/* Parent Product Row */}
                                    <div className="flex items-center px-5 py-4 group">
                                        {/* Expand toggle */}
                                        <div className="w-8 flex-shrink-0">
                                            {hasVariants ? (
                                                <button
                                                    onClick={() => toggleExpand(product.product_id)}
                                                    className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                >
                                                    <motion.div
                                                        animate={{ rotate: isExpanded ? 90 : 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </motion.div>
                                                </button>
                                            ) : (
                                                <div className="w-4 h-4" />
                                            )}
                                        </div>

                                        {/* Product Image */}
                                        <div className="h-12 w-12 flex-shrink-0 relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                            {product.image ? (
                                                <Image
                                                    src={product.image}
                                                    alt={product.name_en}
                                                    fill={true}
                                                    sizes="48px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full w-full text-gray-400">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0 mx-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900 truncate">
                                                    {i18n.language === "ar" ? product.name_ar : product.name_en}
                                                </span>
                                                {hasVariants && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-100 text-purple-700 border border-purple-200">
                                                        <Layers className="w-3 h-3" />
                                                        {product.variants.length} {i18n.language === 'ar' ? 'أنواع' : 'variants'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[280px]">
                                                {i18n.language === "ar" ? product.description_ar : product.description_en}
                                            </div>
                                        </div>

                                        {/* Category */}
                                        <div className="w-32 text-center flex-shrink-0 hidden lg:block">
                                            <span className="px-2.5 py-1 inline-flex text-[11px] leading-5 font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                                                {getCategoryNames(product) || 'Uncategorized'}
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <div className="w-32 text-center flex-shrink-0">
                                            {hasVariants ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs text-gray-400 mb-0.5">{i18n.language === 'ar' ? 'السعر من' : 'Price range'}</span>
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {Math.min(...product.variants.map(v => v.price))} - {Math.max(...product.variants.map(v => v.price))}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {t('{{price, currency}}', { price: product.price })}
                                                </span>
                                            )}
                                        </div>

                                        {/* Stock */}
                                        <div className="w-36 flex-shrink-0">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${stockInfo.bg} ${stockInfo.text}`}>
                                                    <div className={`h-1.5 w-1.5 rounded-full ${stockInfo.dot}`}></div>
                                                    {stockInfo.label}
                                                </span>
                                                {!hasVariants && (
                                                    <button
                                                        onClick={() => handleOpenStockModal(product)}
                                                        className="p-1 text-primary-600 hover:bg-primary-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                        title={t("addStock")}
                                                    >
                                                        <PlusCircle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            {hasVariants && (
                                                <p className="text-[10px] text-gray-400 text-center mt-1">{i18n.language === 'ar' ? 'إجمالي كل الأنواع' : 'Total across variants'}</p>
                                            )}
                                        </div>

                                        {/* Visibility */}
                                        <div className="w-24 flex-shrink-0 flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleVisibilityToggle(product)}
                                                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${product.visible ? 'bg-green-500' : 'bg-gray-300'}`}
                                            >
                                                <motion.div
                                                    layout
                                                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                                                    className={`bg-white w-4 h-4 rounded-full shadow-md ${i18n.dir() === 'ltr' ? product.visible ? 'translate-x-4' : 'translate-x-0' : product.visible ? '-translate-x-4' : 'translate-x-0'}`}
                                                />
                                            </button>
                                            {product.visible
                                                ? <Eye className="w-3.5 h-3.5 text-green-600" />
                                                : <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                                            }
                                        </div>

                                        {/* Actions */}
                                        <div className="w-20 flex-shrink-0 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => router.push(`/admin/products/edit/${product.slug}`)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title={t("edit")}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title={t("delete")}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Variant Sub-rows */}
                                    <AnimatePresence>
                                        {hasVariants && isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                            >
                                                {/* Variants header */}
                                                <div className="px-5 py-2 bg-purple-50/60 border-t border-purple-100 flex items-center gap-2">
                                                    <Layers className="w-3.5 h-3.5 text-purple-500" />
                                                    <span className="text-xs font-semibold text-purple-700">
                                                        {i18n.language === 'ar' ? `الأنواع (${product.variants.length})` : `Variants (${product.variants.length})`}
                                                    </span>
                                                    <div className="flex-1 h-px bg-purple-200/60"></div>
                                                </div>

                                                {product.variants.map((variant, idx) => {
                                                    const variantStockInfo = getStockBadge(variant.stock);
                                                    return (
                                                        <motion.div
                                                            key={variant.slug}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                                                            className={`flex items-center px-5 py-3 group/variant hover:bg-purple-50/30 transition-colors ${idx < product.variants.length - 1 ? 'border-b border-gray-100' : ''}`}
                                                        >
                                                            {/* Tree line indicator */}
                                                            <div className="w-8 flex-shrink-0 flex justify-center">
                                                                <div className="flex flex-col items-center">
                                                                    <div className={`w-px ${idx === 0 ? 'h-2' : 'h-full'} bg-purple-200`}></div>
                                                                    <div className="w-2 h-2 rounded-full bg-purple-300 border-2 border-purple-100"></div>
                                                                    <div className={`w-px ${idx === product.variants.length - 1 ? 'h-0' : 'h-2'} bg-purple-200`}></div>
                                                                </div>
                                                            </div>

                                                            {/* Variant Image */}
                                                            <div className="h-10 w-10 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                                {variant.image ? (
                                                                    <Image
                                                                        src={variant.image}
                                                                        alt={variant.name_en}
                                                                        fill={true}
                                                                        sizes="40px"
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex items-center justify-center h-full w-full text-gray-300">
                                                                        <Box className="w-4 h-4" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Variant Info */}
                                                            <div className="flex-1 min-w-0 mx-4">
                                                                <span className="text-sm font-medium text-gray-700">{i18n.language === "ar" ? variant.name_ar : variant.name_en}</span>
                                                                {variant.type_en && (
                                                                    <span className="ml-2 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                        {i18n.language === 'ar' ? variant.type_ar : variant.type_en}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Category spacer */}
                                                            <div className="w-32 flex-shrink-0 hidden lg:block"></div>

                                                            {/* Price */}
                                                            <div className="w-32 text-center flex-shrink-0">
                                                                <span className="text-sm font-semibold text-gray-600">
                                                                    {t('{{price, currency}}', { price: variant.price })}
                                                                </span>
                                                                {variant.discount > 0 && (
                                                                    <span className="ml-1 text-[10px] text-red-500 font-medium">-{variant.discount}%</span>
                                                                )}
                                                            </div>

                                                            {/* Stock */}
                                                            <div className="w-36 flex-shrink-0">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${variantStockInfo.bg} ${variantStockInfo.text}`}>
                                                                        <div className={`h-1.5 w-1.5 rounded-full ${variantStockInfo.dot}`}></div>
                                                                        {variant.stock}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => {
                                                                            // Create a pseudo-product for the stock modal
                                                                            setSelectedProduct({
                                                                                ...product,
                                                                                variant_id: variant.id,
                                                                                stock: variant.stock,
                                                                                name_en: variant.name_en,
                                                                                name_ar: variant.name_ar,
                                                                            });
                                                                            setIsStockModalOpen(true);
                                                                        }}
                                                                        className="p-1 text-primary-600 hover:bg-primary-50 rounded-full transition-colors opacity-0 group-hover/variant:opacity-100"
                                                                        title={t("addStock")}
                                                                    >
                                                                        <PlusCircle size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Visibility spacer */}
                                                            <div className="w-24 flex-shrink-0"></div>

                                                            {/* Variant actions */}
                                                            <div className="w-20 flex-shrink-0 flex items-center justify-end">
                                                                <button
                                                                    onClick={() => router.push(`/admin/products/edit/${variant.slug}`)}
                                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover/variant:opacity-100"
                                                                    title={t("edit")}
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Mobile Grid/Cards */}
                <div className="md:hidden grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                {t("noProductsFound")}
                                {(filterCategory || filterStock !== 'all' || filterType !== 'all' || searchTerm) && (
                                    <button
                                        onClick={clearFilters}
                                        className="block mx-auto mt-2 text-primary-600 text-sm hover:underline"
                                    >
                                        {t("clearAllFilters")}
                                    </button>
                                )}
                            </div>
                        ) : filteredProducts.map((product) => {
                            const hasVariants = product.variants && product.variants.length > 0;
                            const isExpanded = expandedProducts.has(product.product_id);
                            const totalVariantStock = hasVariants
                                ? product.variants.reduce((sum, v) => sum + v.stock, 0)
                                : product.stock;
                            const stockInfo = getStockBadge(totalVariantStock);

                            return (
                                <motion.div
                                    key={product.slug}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    layout
                                    className={`bg-white rounded-xl shadow-sm border overflow-hidden ${hasVariants && isExpanded ? 'border-purple-200' : 'border-gray-200'}`}
                                >
                                    <div className="p-4 flex gap-4">
                                        <div className="h-20 w-20 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                            {product.image ? (
                                                <Image
                                                    src={product.image}
                                                    alt={product.name_en}
                                                    fill={true}
                                                    sizes="80px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full w-full text-gray-400">
                                                    <Package className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                                    <h3 className="text-sm font-semibold text-gray-900 truncate">{i18n.language === "ar" ? product.name_ar : product.name_en}</h3>
                                                    {hasVariants && (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-purple-100 text-purple-700 border border-purple-200 flex-shrink-0">
                                                            <Layers className="w-3 h-3" />
                                                            {product.variants.length}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-1 flex-shrink-0">
                                                    <button
                                                        onClick={() => router.push(`/admin/products/edit/${product.slug}`)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <button
                                                    onClick={() => handleVisibilityToggle(product)}
                                                    className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${product.visible ? 'bg-green-500' : 'bg-gray-300'}`}
                                                >
                                                    <motion.div
                                                        layout
                                                        transition={{ type: "spring", stiffness: 700, damping: 30 }}
                                                        className={`bg-white w-4 h-4 rounded-full shadow-md ${product.visible ? 'translate-x-4' : 'translate-x-0'}`}
                                                    />
                                                </button>
                                                <span className={`text-xs font-medium ${product.visible ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {product.visible ? t("visible") : t("hidden")}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">{getCategoryNames(product) || 'Uncategorized'}</p>
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-sm font-bold text-gray-900">
                                                    {hasVariants ? (
                                                        <span className="text-xs">{Math.min(...product.variants.map(v => v.price))} - {Math.max(...product.variants.map(v => v.price))}</span>
                                                    ) : (
                                                        t('{{price, currency}}', { price: product.price })
                                                    )}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${stockInfo.bg} ${stockInfo.text}`}>
                                                        <div className={`h-1.5 w-1.5 rounded-full ${stockInfo.dot}`}></div>
                                                        {hasVariants ? `${totalVariantStock} total` : (totalVariantStock > 0 ? `${totalVariantStock} ${t("left")}` : t("outOfStock"))}
                                                    </span>
                                                    {!hasVariants && (
                                                        <button
                                                            onClick={() => handleOpenStockModal(product)}
                                                            className="p-1 text-primary-600 bg-primary-50 rounded-full"
                                                        >
                                                            <PlusCircle size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Variant expand */}
                                    {hasVariants && (
                                        <>
                                            <button
                                                onClick={() => toggleExpand(product.product_id)}
                                                className={`w-full py-2.5 px-4 border-t text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${isExpanded ? 'bg-purple-50 border-purple-100 text-purple-700' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'}`}
                                            >
                                                <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </motion.div>
                                                <Layers className="w-3.5 h-3.5" />
                                                {isExpanded
                                                    ? (i18n.language === 'ar' ? 'إخفاء الأنواع' : 'Hide variants')
                                                    : (i18n.language === 'ar' ? `عرض ${product.variants.length} أنواع` : `Show ${product.variants.length} variants`)}
                                            </button>
                                            <AnimatePresence>
                                                {isExpanded && product.variants.map((variant, idx) => {
                                                    const variantStockInfo = getStockBadge(variant.stock);
                                                    return (
                                                        <motion.div
                                                            key={variant.slug}
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.2, delay: idx * 0.04 }}
                                                            className="px-4 py-3 bg-purple-50/30 border-t border-purple-100/60 flex items-center gap-3"
                                                        >
                                                            {/* Tree line */}
                                                            <div className="flex flex-col items-center w-4 flex-shrink-0">
                                                                <div className="w-0.5 h-2 bg-purple-200 rounded"></div>
                                                                <div className="w-2 h-2 rounded-full bg-purple-300 border-2 border-purple-100"></div>
                                                                {idx < product.variants.length - 1 && <div className="w-0.5 h-2 bg-purple-200 rounded"></div>}
                                                            </div>
                                                            <div className="h-12 w-12 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                                {variant.image ? (
                                                                    <Image src={variant.image} alt={variant.name_en} fill sizes="48px" className="object-cover" />
                                                                ) : (
                                                                    <div className="flex items-center justify-center h-full w-full text-gray-300"><Box className="w-4 h-4" /></div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-xs font-semibold text-gray-700 truncate">{i18n.language === "ar" ? variant.name_ar : variant.name_en}</p>
                                                                    {variant.type_en && (
                                                                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                            {i18n.language === 'ar' ? variant.type_ar : variant.type_en}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-1.5">
                                                                    <span className="text-xs font-bold text-gray-800">{t('{{price, currency}}', { price: variant.price })}</span>
                                                                    {variant.discount > 0 && (
                                                                        <span className="text-[10px] text-red-500 font-medium">-{variant.discount}%</span>
                                                                    )}
                                                                    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${variantStockInfo.bg} ${variantStockInfo.text}`}>
                                                                        <div className={`h-1 w-1 rounded-full ${variantStockInfo.dot}`}></div>
                                                                        {variant.stock > 0 ? `${variant.stock} ${t("left")}` : t("outOfStock")}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => router.push(`/admin/products/edit/${variant.slug}`)}
                                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            <StockUpdateModal
                isOpen={isStockModalOpen}
                onClose={() => setIsStockModalOpen(false)}
                onConfirm={handleAddStock}
                title={t("addProductStock") || "Add Product Stock"}
                itemName={i18n.language === 'ar' ? selectedProduct?.name_ar || "" : selectedProduct?.name_en || ""}
                currentStock={selectedProduct?.stock}
                productId={selectedProduct?.product_id}
                variantId={selectedProduct?.variant_id}
            />
        </motion.div>
    );
}
