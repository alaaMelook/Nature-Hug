"use client";
import React, { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/ui/hooks/admin/products";
import { ImageSelector } from "@/ui/components/admin/imageSelector";
import { MaterialSelector } from "@/ui/components/admin/materialSelector";
import { Material } from "@/domain/entities/database/material";
import { ChevronDown, ChevronUp, Trash2, Plus, Image as ImageIcon, Box } from "lucide-react";

interface CreateProductFormProps {
    initialImages: { image: any; url: string }[];
}

// Helper component for collapsible sections
const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border rounded-lg mb-4 overflow-hidden bg-white shadow-sm">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
            >
                <span className="font-semibold text-gray-700">{title}</span>
                {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
            </button>
            {isOpen && <div className="p-4 border-t">{children}</div>}
        </div>
    );
};

export function CreateProductForm({ initialImages }: CreateProductFormProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [showImageSelector, setShowImageSelector] = useState(false);
    const [showMaterialSelector, setShowMaterialSelector] = useState(false);
    const [activeImageField, setActiveImageField] = useState<'main' | number | null>(null); // 'main' for product, number for variant index
    const [activeMaterialField, setActiveMaterialField] = useState<'main' | number | null>(null);

    const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductAdminView>({
        defaultValues: {
            variants: [],
            gallery: [],
            materials: [],
            faq_en: {},
            faq_ar: {}
        }
    });

    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
        control,
        name: "variants"
    });

    const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({
        control,
        name: "materials"
    });

    const onSubmit = async (data: ProductAdminView) => {
        // 1. Sanitize Numeric Fields
        const cleanNumber = (val: any) => {
            if (val === "" || val === null || val === undefined || isNaN(Number(val))) return 0;
            return Number(val);
        };

        const cleanedData = {
            ...data,
            price: cleanNumber(data.price),
            stock: cleanNumber(data.stock),
            discount: cleanNumber(data.discount),
            category_id: data.category_id ? Number(data.category_id) : undefined,
            variants: data.variants?.map(v => ({
                ...v,
                price: cleanNumber(v.price),
                stock: cleanNumber(v.stock),
                discount: cleanNumber(v.discount),
            })) || []
        };

        // 2. Conditional Validation
        const hasVariants = cleanedData.variants.length > 0;
        const mainPriceSet = cleanedData.price > 0;

        if (!mainPriceSet) {
            if (!hasVariants) {
                toast.error(t("priceRequired")); // Main price required if no variants
                return;
            }

            // If variants exist, ALL must have price and image to bypass main price
            const allVariantsValid = cleanedData.variants.every(v => v.price > 0 && (v.image || (v.gallery && v.gallery.length > 0)));
            if (!allVariantsValid) {
                toast.error("If main price is 0, all variants must have a price and image.");
                return;
            }
        }

        const result = await createProductAction(cleanedData);
        if (result.success) {
            toast.success(t("productCreated"));
            router.push("/admin/products");
        } else {
            toast.error(t("errorCreatingProduct") + (result.error));
        }
    };

    const handleImageSelect = (url: string) => {
        if (activeImageField === 'main') {
            const currentGallery = watch("gallery") || [];
            setValue("gallery", [...currentGallery, url]);
            if (!watch("image")) {
                setValue("image", url);
            }
        } else if (typeof activeImageField === 'number') {
            // Variant image logic
            const currentVariantGallery = watch(`variants.${activeImageField}.gallery`) || [];
            setValue(`variants.${activeImageField}.gallery`, [...currentVariantGallery, url]);
            if (!watch(`variants.${activeImageField}.image`)) {
                setValue(`variants.${activeImageField}.image`, url);
            }
        }
        setShowImageSelector(false);
    };

    const handleMaterialSelect = (material: Material, amount: number) => {
        const materialData = {
            material_id: material.id,
            grams_used: amount,
            amount: amount, // Keep for UI if needed, or remove if unused
            // @ts-ignore
            material_name: material.name,
            material_price: material.price_per_gram,
            material_unit: material.unit || undefined,
            measurement_unit: material.unit || 'gm'
        };

        if (activeMaterialField === 'main') {
            appendMaterial(materialData);
        } else if (typeof activeMaterialField === 'number') {
            const currentMaterials = watch(`variants.${activeMaterialField}.materials`) || [];
            setValue(`variants.${activeMaterialField}.materials`, [...currentMaterials, materialData]);
        }
    };

    const calculateTotalCost = () => {
        const materials = watch("materials") || [];
        return materials.reduce((total, item: any) => {
            return total + ((item.grams_used || item.amount || 0) * (item.material_price || 0));
        }, 0).toFixed(2);
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className=" text-xl md:text-3xl font-bold text-gray-800">{t("createProduct")}</h1>
                <button
                    onClick={handleSubmit(onSubmit)}
                    className="fixed bottom-10 right-10 z-50 md:flex md:max-w-7xl  p-4 md:px-6 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md font-medium"
                >
                    {t("saveProduct")}
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Main Info & Variants (1/2 width) */}
                <div className="space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">{t("basicInformation")}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("nameEn")}</label>
                                <input

                                    {...register("name_en", {
                                        required: true,
                                        onChange: (e) => setValue("slug", generateSlug(e.target.value))
                                    })}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("nameAr")}</label>
                                <input {...register("name_ar")} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("slug")}</label>
                                <input placeholder="Auto-generated" {...register("slug", { required: true })} className="text-sm w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("category")}</label>
                                <input type="number" {...register("category_id")} className="text-sm w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" placeholder="ID" />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Skin Type</label>
                                <input {...register("skin_type")} className="text-sm w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" placeholder="e.g. Oily, Dry" />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Product Type</label>
                                <input {...register("product_type")} className="text-sm w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" placeholder="e.g. Cream, Serum" />
                            </div>
                        </div>

                    </div>

                    {/* Media */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                            <ImageIcon size={18} /> Media
                        </h2>
                        <div className="grid grid-cols-3 gap-2">
                            {watch("gallery")?.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border group">
                                    <img src={url} alt="Product" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newGallery = watch("gallery").filter((_, i) => i !== index);
                                            setValue("gallery", newGallery);
                                            if (watch("image") === url) setValue("image", newGallery[0] || "");
                                        }}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => { setActiveImageField('main'); setShowImageSelector(true); }}
                                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <Plus size={24} />
                                <span className="text-xs mt-1">{t("add")}</span>
                            </button>
                        </div>
                    </div>
                    {/* Collapsible Sections for Details */}
                    <>
                        <CollapsibleSection title={t("fullDescription")} defaultOpen>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
                                    <textarea {...register("description_en")} rows={6} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Arabic</label>
                                    <textarea {...register("description_ar")} rows={6} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
                                </div>
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title="Highlights">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
                                    <textarea {...register("highlight_en")} rows={3} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" placeholder="Short highlight..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Arabic</label>
                                    <textarea {...register("highlight_ar")} rows={3} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" placeholder="Short highlight..." />
                                </div>
                            </div>
                        </CollapsibleSection>


                    </>



                </div>

                {/* Right Column: Pricing, Stock, Media (1/2 width) */}
                <div className="space-y-6">
                    {/* Pricing & Stock */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                            <Box size={18} /> Inventory & Pricing
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("price")} (EGP)</label>
                                <input type="number" {...register("price")} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("stock")}</label>
                                <input type="number" {...register("stock")} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                                <input type="number" {...register("discount")} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
                            </div>
                        </div>
                    </div>
                    <>
                        <CollapsibleSection title={t("materialsIngredients")}>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-medium text-gray-700">Cost Calculation</h3>
                                    <button
                                        type="button"
                                        onClick={() => { setActiveMaterialField('main'); setShowMaterialSelector(true); }}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                    >
                                        <Plus size={16} /> {t("addMaterial")}
                                    </button>
                                </div>

                                {materialFields.length > 0 ? (
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-500">
                                                <tr>
                                                    <th className="px-4 py-2">Material</th>
                                                    <th className="px-4 py-2 text-right">Amount</th>
                                                    <th className="px-4 py-2 text-right">Cost</th>
                                                    <th className="px-4 py-2"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {materialFields.map((field: any, index) => (
                                                    <tr key={field.id}>
                                                        <td className="px-4 py-2">{field.material_name || `ID: ${field.material_id}`}</td>
                                                        <td className="px-4 py-2 text-right">{field.grams_used || field.amount} {field.material_unit || 'g'}</td>
                                                        <td className="px-4 py-2 text-right">{((field.grams_used || field.amount || 0) * (field.material_price || 0)).toFixed(2)}</td>
                                                        <td className="px-4 py-2 text-right">
                                                            <button type="button" onClick={() => removeMaterial(index)} className="text-red-500 hover:text-red-700">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-gray-50 font-bold">
                                                    <td className="px-4 py-2" colSpan={2}>Total Estimated Cost</td>
                                                    <td className="px-4 py-2 text-right">{calculateTotalCost()} EGP</td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic text-center py-4">{t("noMaterialsListed")}</p>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Public Ingredients List (EN)</label>
                                        <textarea {...register("faq_en.ingredients")} rows={3} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" placeholder="Water, Glycerin, etc." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Public Ingredients List (AR)</label>
                                        <textarea {...register("faq_ar.ingredients")} rows={3} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" placeholder="ماء، جلسرين، إلخ." />
                                    </div>
                                </div>
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title={t("bestFor")}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <textarea {...register("faq_en.best_for")} placeholder="English..." rows={3} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" />
                                <textarea {...register("faq_ar.best_for")} placeholder="Arabic..." rows={3} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" />
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title={t("precautions")}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <textarea {...register("faq_en.precautions")} placeholder="English..." rows={3} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" />
                                <textarea {...register("faq_ar.precautions")} placeholder="Arabic..." rows={3} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" />
                            </div>
                        </CollapsibleSection>
                    </>
                    {/* Variants Section */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {t("variants")} <span className="text-sm font-normal text-gray-500 ml-2">(Fields here override main product details)</span>
                            </h2>
                            <button
                                type="button"
                                onClick={() => appendVariant({ name_en: "", price: 0, stock: 0, gallery: [] } as any)}
                                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1"
                            >
                                <Plus size={16} /> {t("addVariant")}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {variantFields.map((field, index) => (
                                <div key={field.id} className="border rounded-lg p-4 bg-gray-50 relative">
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(index)}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase">{t("variantNameEn")}</label>
                                            <input
                                                {...register(`variants.${index}.name_en` as const, {
                                                    required: true,
                                                    onChange: (e) => setValue(`variants.${index}.slug`, generateSlug(e.target.value))
                                                })}
                                                className="w-full border-gray-300 rounded shadow-sm p-1.5 border text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase">{t("variantNameAr")}</label>
                                            <input {...register(`variants.${index}.name_ar` as const)} className="w-full border-gray-300 rounded shadow-sm p-1.5 border text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase">{t("slug")}</label>
                                            <input {...register(`variants.${index}.slug` as const)} className="w-full border-gray-300 rounded shadow-sm p-1.5 border text-sm" placeholder="Auto-generated" />
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase">{t("price")}</label>
                                            <div className="flex items-center gap-2">
                                                <input type="number" {...register(`variants.${index}.price` as const)} className="w-full border-gray-300 rounded shadow-sm p-1.5 border text-sm" />
                                                {watch(`variants.${index}.materials`)?.length > 0 && (
                                                    <span className="text-xs text-gray-500 whitespace-nowrap" title="Total Material Cost">
                                                        (Cost: {watch(`variants.${index}.materials`).reduce((acc, m) => acc + ((m.grams_used || 0) * (m.material_price || 0)), 0).toFixed(2)})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase">{t("stock")}</label>
                                            <input type="number" {...register(`variants.${index}.stock` as const)} className="w-full border-gray-300 rounded shadow-sm p-1.5 border text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase">Discount</label>
                                            <input type="number" {...register(`variants.${index}.discount` as const)} className="w-full border-gray-300 rounded shadow-sm p-1.5 border text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase">Distinguisher</label>
                                            <input {...register(`variants.${index}.type` as const)} className="w-full border-gray-300 rounded shadow-sm p-1.5 border text-sm" placeholder="e.g. blue, small, 50 ml, ..." />
                                        </div>
                                    </div>

                                    {/* Variant Gallery */}
                                    <div className="mb-4">
                                        <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">{t("images")}</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {watch(`variants.${index}.gallery`)?.map((url, imgIndex) => (
                                                <img key={imgIndex} src={url} alt="Variant" className="h-12 w-12 object-cover rounded border" />
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => { setActiveImageField(index); setShowImageSelector(true); }}
                                                className="h-12 w-12 flex items-center justify-center border-2 border-dashed border-gray-300 rounded hover:border-blue-500 hover:text-blue-500 bg-white"
                                            >
                                                <ImageIcon size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <CollapsibleSection title="Advanced Details (Description & Materials)" defaultOpen={false}>
                                        <div className="space-y-4">
                                            {/* Description Override */}
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Description Override</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">English</label>
                                                        <textarea {...register(`variants.${index}.description_en` as const)} rows={3} className="w-full border-gray-300 rounded shadow-sm p-1.5 border text-sm" placeholder="Override main description..." />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Arabic</label>
                                                        <textarea {...register(`variants.${index}.description_ar` as const)} rows={3} className="w-full border-gray-300 rounded shadow-sm p-1.5 border text-sm" placeholder="Override main description..." />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Variant Materials */}
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-xs font-bold text-gray-700 uppercase">Materials</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setActiveMaterialField(index); setShowMaterialSelector(true); }}
                                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                                    >
                                                        <Plus size={14} /> {t("addMaterial")}
                                                    </button>
                                                </div>

                                                {watch(`variants.${index}.materials`)?.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {watch(`variants.${index}.materials`)?.map((mat, mIndex) => (
                                                            <div key={mIndex} className="flex items-center gap-2 bg-white border rounded-full px-3 py-1 text-xs shadow-sm">
                                                                <span className="font-medium text-gray-700">{mat.material_name || `ID: ${mat.material_id}`}</span>
                                                                <span className="text-gray-500 border-l pl-2 ml-1">{mat.grams_used} {mat.measurement_unit}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const current = watch(`variants.${index}.materials`);
                                                                        setValue(`variants.${index}.materials`, current.filter((_, i) => i !== mIndex));
                                                                    }}
                                                                    className="text-red-400 hover:text-red-600 ml-1"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-400 italic border border-dashed rounded p-2 text-center">
                                                        No specific materials for this variant.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                </div>
                            ))}
                            {variantFields.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4 border-2 border-dashed rounded-lg">
                                    No variants added. Main product details will be used.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </form>
            {showImageSelector && (
                <ImageSelector
                    images={initialImages}
                    onSelect={handleImageSelect}
                    onClose={() => setShowImageSelector(false)}
                />
            )}

            {showMaterialSelector && (
                <MaterialSelector
                    onSelect={handleMaterialSelect}
                    onClose={() => setShowMaterialSelector(false)}
                />
            )}
        </div>
    );
}
