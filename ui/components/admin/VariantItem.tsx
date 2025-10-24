import React from 'react';
import { X, Upload } from 'lucide-react';
import { ProductVariantAdminView, ProductMaterialAdminView } from '@/domain/entities/views/admin/productAdminView';

interface VariantItemProps {
    variant: ProductVariantAdminView;
    onUpdate: (id: number, field: string, value: any) => void;
    onDelete: (id: number) => void;
    materials: Partial<ProductMaterialAdminView>[];
    uploading: boolean;
    handleVariantImageUpload: (variantId: number, e: React.ChangeEvent<HTMLInputElement>, isGallery?: boolean) => void;
}

export const VariantItem: React.FC<VariantItemProps> = ({
    variant,
    onUpdate,
    onDelete,
    materials,
    uploading,
    handleVariantImageUpload
}) => {
    return (
        <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Name (EN)"
                        value={variant.name_en}
                        onChange={(e) => onUpdate(variant.id, "name_en", e.target.value)}
                        className="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
                    />
                    <input
                        type="text"
                        placeholder="Name (AR)"
                        value={variant.name_ar}
                        onChange={(e) => onUpdate(variant.id, "name_ar", e.target.value)}
                        className="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
                    />
                    <textarea
                        placeholder="Description (EN)"
                        value={variant.description_en}
                        onChange={(e) => onUpdate(variant.id, "description_en", e.target.value)}
                        className="w-full border border-gray-300 rounded-md text-sm px-3 py-2 h-24 resize-none"
                    />
                    <textarea
                        placeholder="Description (AR)"
                        value={variant.description_ar}
                        onChange={(e) => onUpdate(variant.id, "description_ar", e.target.value)}
                        className="w-full border border-gray-300 rounded-md text-sm px-3 py-2 h-24 resize-none"
                    />
                </div>

                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="number"
                            placeholder="Price"
                            value={variant.price}
                            onChange={(e) => onUpdate(variant.id, "price", parseFloat(e.target.value) || 0)}
                            className="border border-gray-300 rounded-md text-sm px-3 py-2"
                        />
                        <input
                            type="number"
                            placeholder="Discount"
                            value={variant.discount}
                            onChange={(e) => onUpdate(variant.id, "discount", parseFloat(e.target.value) || 0)}
                            className="border border-gray-300 rounded-md text-sm px-3 py-2"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="number"
                            placeholder="Stock"
                            value={variant.stock}
                            onChange={(e) => onUpdate(variant.id, "stock", parseInt(e.target.value) || 0)}
                            className="border border-gray-300 rounded-md text-sm px-3 py-2"
                        />
                        <input
                            type="text"
                            placeholder="Type"
                            value={variant.type}
                            onChange={(e) => onUpdate(variant.id, "type", e.target.value)}
                            className="border border-gray-300 rounded-md text-sm px-3 py-2"
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Slug"
                        value={variant.slug}
                        onChange={(e) => onUpdate(variant.id, "slug", e.target.value)}
                        className="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
                    />
                </div>
            </div>

            {/* Image Upload */}
            <div className="mt-4">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Variant Image
                        <span className="text-xs text-amber-600 ml-2">
                            (Will override main product image)
                        </span>
                    </label>
                    <div className="flex items-center space-x-4 mt-2">
                        <div className="flex-shrink-0">
                            {variant.image ? (
                                <img
                                    src={variant.image}
                                    alt="Variant preview"
                                    className="h-20 w-20 object-cover rounded-lg border"
                                />
                            ) : (
                                <div className="h-20 w-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <Upload className="h-6 w-6 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleVariantImageUpload(variant.id, e)}
                                className="hidden"
                                id={`variant-image-${variant.id}`}
                            />
                            <label
                                htmlFor={`variant-image-${variant.id}`}
                                className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                            >
                                <Upload className="h-4 w-4 mr-2" /> Upload Image
                            </label>
                            {uploading && (
                                <span className="text-xs text-gray-500 ml-2">
                                    Uploading...
                                </span>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            <button
                type="button"
                onClick={() => onDelete(variant.id)}
                className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};