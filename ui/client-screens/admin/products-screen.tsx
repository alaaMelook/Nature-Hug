"use client";

import { useState } from "react";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { Search, Plus, Filter, Edit, Trash2, Package } from "lucide-react";
import { ProductModal } from "@/ui/components/admin/productModal";
import { deleteProduct } from "@/ui/hooks/admin/products";
import { toast } from "sonner";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Material } from "@/domain/entities/database/material";

export function ProductsScreen({ products, materials }: { products: ProductAdminView[], materials: Material[] }) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductAdminView | undefined>(undefined);

    const filteredProducts = (products || []).filter((product) =>
        product.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name_ar.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (product: ProductAdminView) => {
        if (confirm(t("confirmDeleteProduct"))) {
            const result = await deleteProduct(product);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success(t("productDeletedSuccessfully") || "Product deleted successfully");
            }
        }
    };

    const handleEdit = (product: ProductAdminView) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(undefined);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t("products")}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t("manageInventory")}</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedProduct(undefined);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-100 transition-all w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {t("addProduct")}
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
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
                    <button className="flex items-center justify-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto">
                        <Filter className="w-4 h-4 mr-2 text-gray-500" />
                        {t("filter")}
                    </button>
                </div>
            </div>

            {/* Product List */}
            <div className="md:bg-white rounded-xl md:shadow-sm md:border md:border-gray-200 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("product")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("category")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("price")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("stock")}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                        {t("noProductsFound")}
                                    </td>
                                </tr>
                            ) : filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
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
                                                <div className="text-sm font-medium text-gray-900">{product.name_en}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{product.description_en}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700">
                                            {product.category_name_en ?? product.category_name_ar ?? 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.price} {t("EGP")}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`h-2.5 w-2.5 rounded-full mr-2 ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                            <span className="text-sm text-gray-500">{product.stock} {t("leftInStock")}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* <button
                                                onClick={() => handleEdit(product)}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title={t("edit")}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button> */}
                                            <button
                                                onClick={() => handleDelete(product)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title={t("delete")}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Grid/Cards */}
                <div className="md:hidden grid grid-cols-1 gap-4">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            {t("noProductsFound")}
                        </div>
                    ) : filteredProducts.map((product) => (
                        <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4">
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
                                <p className="text-xs text-gray-500 mt-0.5">{product.category?.name_en || 'Uncategorized'}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-900">{product.price} {t("EGP")}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {product.stock > 0 ? `${product.stock} ${t("left")}` : t("outOfStock")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <ProductModal
                    onClose={handleCloseModal}
                    materials={materials}
                    initial={selectedProduct}
                    onSaved={() => {
                        // In a real app, you might trigger a refresh here
                        handleCloseModal();
                    }}
                />
            )}
        </div>
    );
}
