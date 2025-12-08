'use client';
import { useState, useRef, useEffect } from "react";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { Search, Plus, Filter, Edit, Trash2, Package, PlusCircle, X, Check, ChevronDown } from "lucide-react";
import { ProductModal } from "@/ui/components/admin/productModal";
import { deleteProduct } from "@/ui/hooks/admin/products";
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
    const filterRef = useRef<HTMLDivElement>(null);

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

    // Extract unique categories for filter
    const uniqueCategories = Array.from(new Set(products.map(p =>
        i18n.language === 'ar' ? (p.category_name_ar ?? p.category_name_en) : p.category_name_en
    ))).filter(Boolean) as string[];

    const filteredProducts = (products || []).filter((product) => {
        // 1. Search Filter
        const matchesSearch = product.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.name_ar.toLowerCase().includes(searchTerm.toLowerCase());

        // 2. Category Filter
        const productCategory = i18n.language === 'ar' ? (product.category_name_ar ?? product.category_name_en) : product.category_name_en;
        const matchesCategory = filterCategory ? productCategory === filterCategory : true;

        // 3. Stock Filter
        let matchesStock = true;
        if (filterStock === 'in_stock') matchesStock = product.stock > 0;
        if (filterStock === 'out_of_stock') matchesStock = product.stock === 0;
        if (filterStock === 'low_stock') matchesStock = product.stock > 0 && product.stock <= 10;

        return matchesSearch && matchesCategory && matchesStock;
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

    const clearFilters = () => {
        setFilterCategory(null);
        setFilterStock('all');
        setSearchTerm("");
        setIsFilterOpen(false);
    };

    const activeFiltersCount = (filterCategory ? 1 : 0) + (filterStock !== 'all' ? 1 : 0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t("products")}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t("manageInventory")}</p>
                </div>
                <button
                    onClick={() => {
                        router.push("/admin/products/create");
                    }}
                    className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-100 transition-all w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 mx-2" />
                    {t("addProduct")}
                </button>
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
                <div className="flex items-center gap-2 w-full sm:w-auto relative" ref={filterRef}>
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
                                        {(filterCategory || filterStock !== 'all') && (
                                            <button
                                                onClick={clearFilters}
                                                className="text-xs text-red-500 hover:text-red-600 flex items-center"
                                            >
                                                <X className="w-3 h-3 mr-1" />
                                                {t("clearAll")}
                                            </button>
                                        )}
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

            {/* Product List */}
            <div className="md:bg-white rounded-xl md:shadow-sm md:border md:border-gray-200 overflow-hidden relative z-0">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">{t("product")}</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">{t("category")}</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">{t("price")}</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">{t("stock")}</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <AnimatePresence>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                            {t("noProductsFound")}
                                            {(filterCategory || filterStock !== 'all' || searchTerm) && (
                                                <button
                                                    onClick={clearFilters}
                                                    className="block mx-auto mt-2 text-primary-600 text-sm hover:underline"
                                                >
                                                    {t("clearAllFilters")}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : filteredProducts.map((product) => (
                                    <motion.tr
                                        key={product.slug}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        layout
                                        className="hover:bg-gray-50 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200 mx-5">
                                                    {product.image ? (
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name_en}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full w-full text-gray-400">
                                                            <Package className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{i18n.language === "ar" ? product.name_ar : product.name_en}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{i18n.language === "ar" ? product.description_ar : product.description_en}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700">
                                                {i18n.language === "ar" ? product.category_name_ar ?? product.category_name_en : product.category_name_en}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                            {t('{{price, currency}}', { price: product.price })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center justify-center items-center flex ">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2.5 w-2.5 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                                <span className="text-sm text-gray-500">{product.stock} {t("leftInStock")}</span>
                                                <button
                                                    onClick={() => handleOpenStockModal(product)}
                                                    className="p-1 text-primary-600 hover:bg-primary-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                    title={t("addStock")}
                                                >
                                                    <PlusCircle size={16} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title={t("delete")}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Mobile Grid/Cards */}
                <div className="md:hidden grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                {t("noProductsFound")}
                                {(filterCategory || filterStock !== 'all' || searchTerm) && (
                                    <button
                                        onClick={clearFilters}
                                        className="block mx-auto mt-2 text-primary-600 text-sm hover:underline"
                                    >
                                        {t("clearAllFilters")}
                                    </button>
                                )}
                            </div>
                        ) : filteredProducts.map((product) => (
                            <motion.div
                                key={product.slug}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                layout
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4"
                            >
                                <div className="h-20 w-20 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.name_en}
                                            fill
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
                                        <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">{product.name_en}</h3>
                                        <div className="flex items-center space-x-1">

                                            <button
                                                onClick={() => handleDelete(product)}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{i18n.language === "ar" ? product.category_name_ar ?? product.category_name_en : product.category_name_en || 'Uncategorized'}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-900">{t('{{price, currency}}', { price: product.price })}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {product.stock > 0 ? `${product.stock} ${t("left")}` : t("outOfStock")}
                                            </span>
                                            <button
                                                onClick={() => handleOpenStockModal(product)}
                                                className="p-1 text-primary-600 bg-primary-50 rounded-full"
                                            >
                                                <PlusCircle size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
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

            />
        </motion.div>
    );
}
