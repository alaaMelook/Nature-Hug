"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateProductAction } from "@/ui/hooks/admin/products";
import { Category } from "@/domain/entities/database/category";
import { CategoryMultiSelect } from "@/ui/components/admin/CategoryMultiSelect";

interface EditProductFormProps {
    initialCategories: Category[];
    initialProduct: ProductAdminView;
}

// Simple edit form - only basic fields
export function EditProductForm({ initialCategories, initialProduct }: EditProductFormProps) {
    const { t, i18n } = useTranslation();
    const router = useRouter();

    const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductAdminView>({
        defaultValues: {
            ...initialProduct,
            category_ids: initialProduct.category_ids || []
        }
    });

    const onSubmit = async (data: ProductAdminView) => {
        try {
            const result = await updateProductAction({
                ...data,
                product_id: initialProduct.product_id,
                variant_id: initialProduct.variant_id,
                image: initialProduct.image,
                slug: initialProduct.slug,
                gallery: initialProduct.gallery || [],
                variants: initialProduct.variants || [],
                materials: initialProduct.materials || [],
                category_ids: data.category_ids || []
            });

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success(t("productEdited") || "Product updated successfully");
                router.push("/admin/products");
                router.refresh();
            }
        } catch (error: any) {
            toast.error(error.message || t("errorUpdatingProduct"));
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">{t("editProduct")}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Info Section */}
                <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">{t("basicInfo") || "Basic Info"}</h2>

                    {/* Name EN */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("nameEn")}</label>
                        <input
                            {...register("name_en", { required: true })}
                            className={`w-full border rounded-lg p-2 ${errors.name_en ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.name_en && <span className="text-red-500 text-xs">{t("required")}</span>}
                    </div>

                    {/* Name AR */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("nameAr")}</label>
                        <input
                            {...register("name_ar")}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            dir="rtl"
                        />
                    </div>

                    {/* Description EN */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("descriptionEn")}</label>
                        <textarea
                            {...register("description_en")}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg p-2"
                        />
                    </div>

                    {/* Description AR */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("descriptionAr")}</label>
                        <textarea
                            {...register("description_ar")}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            dir="rtl"
                        />
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">{t("pricing") || "Pricing"}</h2>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t("price")}</label>
                            <input
                                type="number"
                                step="0.01"
                                {...register("price", { required: true, min: 0 })}
                                className={`w-full border rounded-lg p-2 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                            />
                        </div>

                        {/* Discount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t("discount")}</label>
                            <input
                                type="number"
                                step="0.01"
                                {...register("discount", { min: 0 })}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                    </div>

                    {/* Stock */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("stock")}</label>
                        <input
                            type="number"
                            {...register("stock", { min: 0 })}
                            className="w-full border border-gray-300 rounded-lg p-2"
                        />
                    </div>
                </div>

                {/* Category Section */}
                <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">{t("category")}</h2>

                    <Controller
                        name="category_ids"
                        control={control}
                        render={({ field }) => (
                            <CategoryMultiSelect
                                categories={initialCategories}
                                selectedIds={field.value || []}
                                onChange={field.onChange}
                                language={i18n.language}
                            />
                        )}
                    />
                </div>

                {/* Product & Skin Type Section */}
                <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">{t("productDetails") || "Product Details"}</h2>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Skin Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t("skinType") || "Skin Type"}</label>
                            <input
                                {...register("skin_type")}
                                className="w-full border border-gray-300 rounded-lg p-2"
                                placeholder={t("placeholders.skinType") || "e.g., oily, dry, combination"}
                            />
                        </div>

                        {/* Product Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t("productType") || "Product Type"}</label>
                            <input
                                {...register("product_type")}
                                className="w-full border border-gray-300 rounded-lg p-2"
                                placeholder={t("placeholders.productType") || "e.g., skincare, haircare"}
                            />
                        </div>
                    </div>
                </div>

                {/* Highlights Section */}
                <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">{t("highlights") || "Highlights"}</h2>

                    {/* Highlight EN */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("highlightEn") || "Highlights (English)"}</label>
                        <textarea
                            {...register("highlight_en")}
                            rows={3}
                            placeholder={t("highlightPlaceholder") || "Enter product highlights, one per line..."}
                            className="w-full border border-gray-300 rounded-lg p-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">{t("highlightHint") || "Separate each highlight with a new line"}</p>
                    </div>

                    {/* Highlight AR */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("highlightAr") || "Highlights (Arabic)"}</label>
                        <textarea
                            {...register("highlight_ar")}
                            rows={3}
                            placeholder={t("highlightPlaceholderAr") || "أدخل مميزات المنتج، واحدة في كل سطر..."}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            dir="rtl"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">{t("highlightHintAr") || "افصل كل ميزة بسطر جديد"}</p>
                    </div>
                </div>

                {/* Visibility */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            {...register("visible")}
                            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{t("visible") || "Visible"}</span>
                    </label>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                        {isSubmitting ? t("saving") || "Saving..." : t("saveChanges") || "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
