"use client";
import { useEffect, useState } from "react";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { ProductModal } from "@/ui/components/admin/productModal";
import { useRouter } from 'next/navigation';

// import { useProductForm } from "@/ui/hooks/admin/useProductsForm";
import { useProfitCalculator } from "@/ui/hooks/admin/useProfitCalculator";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { Category } from "@/domain/entities/database/category";
import { Material } from "@/domain/entities/database/material";
import { deleteProduct } from "@/ui/hooks/admin/useAllProductsData";

export function ProductsScreen({ materials, initProducts }: { materials: Material[], initProducts?: ProductAdminView[] }) {
    const [searchTerm, setSearchTerm] = useState<string | null>(null);
    const [products, setProducts] = useState<ProductAdminView[]>(initProducts || []);


    // const { formData, setFormData, setImageFile, saveProduct, saving } = useProductForm();

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();

    const openAddModal = () => {
        setIsEditing(false);
        // setFormData({});
        // setImageFile(null);
        setShowModal(true);
    };

    const openEditModal = (product: ProductAdminView) => {
        setIsEditing(true);
        // setFormData(product);
        // setImageFile(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        // setFormData({});
        setIsEditing(false);
    };
    useEffect(() => {
        setProducts(initProducts || []);
    }, []);
    useEffect(() => {
        if (!searchTerm) return;
        if (searchTerm.trim() === "") {
            setProducts(initProducts || []);
            return;
        }
        setProducts(products.filter(product =>
            product.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.name_en.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.slug?.toLowerCase().includes(searchTerm.toLowerCase())
        ));
    }, [searchTerm]);


    const hasProducts = products && products.length > 0;

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
                <button
                    onClick={() => openAddModal()}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-1" /> Add Product
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-4 w-full max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                    className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search..."
                    value={searchTerm || ""}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-left">
                            <th className="px-4 py-2 font-medium text-gray-700">Name (EN)</th>
                            <th className="px-4 py-2 font-medium text-gray-700">Price</th>
                            <th className="px-4 py-2 font-medium text-gray-700">Cost</th>
                            <th className="px-4 py-2 font-medium text-gray-700">Profit</th>
                            <th className="px-4 py-2 font-medium text-gray-700">Stock</th>
                            <th className="px-4 py-2 font-medium text-gray-700 w-24">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hasProducts ? (
                            products.map((p) => {
                                const { totalCost, profit, profitMargin } = useProfitCalculator(p, materials || []);
                                return (
                                    <tr key={p.slug} className="border-t hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-2">{p.name_en}</td>
                                        <td className="px-4 py-2">{p.price} EGP</td>
                                        <td className="px-4 py-2 text-red-600">{totalCost.toFixed(2)} EGP</td>
                                        <td
                                            className={`px-4 py-2 font-semibold ${profit >= 0 ? "text-green-600" : "text-red-600"
                                                }`}
                                        >
                                            {profit.toFixed(2)} EGP
                                        </td>
                                        <td className="px-4 py-2">{p.stock}</td>
                                        <td className="px-4 py-2">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => openEditModal(p)}
                                                    className="text-blue-600 hover:text-blue-800 p-1"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={async () => await deleteProduct(p)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                    title="Delete"

                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center text-gray-500 py-6 italic">
                                    No products found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <ProductModal
                    onClose={() => { closeModal(); router.refresh(); }}
                    materials={materials || []}
                    initial={undefined}
                    onSaved={() => { /* refresh handled */ }}
                />
            )}
        </div>
    );
}
