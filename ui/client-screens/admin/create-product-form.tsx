"use client";
import React, { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ProductAdminView, ProductMaterialAdminView } from "@/domain/entities/views/admin/productAdminView";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/ui/hooks/admin/products";
import { ImageSelector } from "@/ui/components/admin/imageSelector";
import { MaterialSelector } from "@/ui/components/admin/materialSelector";
import { Material } from "@/domain/entities/database/material";
import { Category } from "@/domain/entities/database/category";
import { ChevronDown, ChevronUp, Trash2, Plus, Image as ImageIcon, Box, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CreateProductFormProps {
    initialImages: { image: any; url: string }[];
    initialCategories: Category[];
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
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 border-t">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export function CreateProductForm({ initialImages, initialCategories }: CreateProductFormProps) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [showImageSelector, setShowImageSelector] = useState(false);
    const [showMaterialSelector, setShowMaterialSelector] = useState(false);
    const [activeImageField, setActiveImageField] = useState<'main' | number | null>(null); // 'main' for product, number for variant index
    const [activeMaterialField, setActiveMaterialField] = useState<'main' | number | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [lastStepChangeTime, setLastStepChangeTime] = useState(0);

    const steps = [
        { id: 'essentials', title: t("stepEssentials") },
        { id: 'media', title: t("stepMedia") },
        { id: 'pricing', title: t("stepPricing") },
        { id: 'variants', title: t("stepVariants") },
        { id: 'extras', title: t("stepExtras") },
    ];

    const { register, control, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<ProductAdminView & { image_url: string }>({
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

        let cleanedData = {
            ...data,
            name_ar: data.name_ar.trim().length > 0 ? data.name_ar.trim() : data.name_en.trim(),
            price: cleanNumber(data.price),
            image_url: watch("image_url"),
            stock: cleanNumber(data.stock),
            visible: true,
            discount: cleanNumber(data.discount),
            // gallery: data.gallery.slice(1, data.gallery.length),
            category_id: data.category_id ? Number(data.category_id) : undefined,
            variants: data.variants?.map(v => ({
                ...v,
                // gallery: v.gallery.slice(1, v.gallery.length),
                price: cleanNumber(v.price),
                stock: cleanNumber(v.stock),
                discount: cleanNumber(v.discount),
            })) || []
        };

        // 2. Conditional Validation
        const hasVariants = cleanedData.variants.length > 0;
        const mainPriceSet = cleanedData.price > 0;

        // Prevent premature submission (e.g. via Enter key on earlier steps)
        if (currentStep !== steps.length - 1) {
            return;
        }

        // Prevent accidental double-click submission when transitioning to the last step
        if (Date.now() - lastStepChangeTime < 1000) {
            return;
        }

        if (!mainPriceSet) {
            if (!hasVariants) {
                toast.error(t("priceRequired")); // Main price required if no variants
                return;
            }

            // If variants exist, ALL must have price and image to bypass main price
            const allVariantsValid = cleanedData.variants.every(v => v.price > 0);
            if (!allVariantsValid) {
                toast.error(t("variantsRequired"));
                return;
            }
        }
        console.log("[CreateProductForm] Submitting data:", cleanedData);
        const result = await createProductAction(cleanedData);
        if (result.success) {
            toast.success(t("productCreated"));
            router.push("/admin/products");
        } else {
            toast.error(t("errorCreatingProduct") + (result.error));
        }
    };
    // --- Locate this function in your CreateProductForm component ---
    const handleImageSelect = (url: string) => {
        if (activeImageField === 'main') {
            const isImageUrlEmpty = !watch("image_url"); // Check if it's currently empty

            if (isImageUrlEmpty) {
                // 1. If empty, set as the main image (image_url) and DON'T touch the gallery.
                setValue("image_url", url);
            } else {
                // 2. If NOT empty, set as a gallery image.
                const currentGallery = watch("gallery") || [];
                setValue("gallery", [...currentGallery, url]);
            }

        } else if (typeof activeImageField === 'number') {
            const isVariantImageEmpty = !watch(`variants.${activeImageField}.image`); // Check if it's currently empty

            if (isVariantImageEmpty) {
                // 1. If empty, set as the variant main image (variants[i].image).
                setValue(`variants.${activeImageField}.image`, url);
            } else {
                // 2. If NOT empty, set as a variant gallery image.
                const currentVariantGallery = watch(`variants.${activeImageField}.gallery`) || [];
                setValue(`variants.${activeImageField}.gallery`, [...currentVariantGallery, url]);
            }
        }
        setShowImageSelector(false);
    };

    const handleMaterialSelect = (material: Material, amount: number) => {
        const materialData: ProductMaterialAdminView = {
            id: material.id,
            grams_used: amount,

            // @ts-ignore
            material_name: material.name,
            material_type: material.material_type,
            price: material.price_per_gram,
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
        // const materials = watch("materials") || [];
        return materialFields.reduce((total, item: ProductMaterialAdminView) => {
            return total + ((item.grams_used || 0) * (item.price || 0));
        }, 0).toFixed(2);
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    };

    const nextStep = async () => {
        let isValid = false;
        if (currentStep === 0) {
            isValid = await trigger(["name_en", "slug", "category_id"]);
        } else {
            isValid = true;
        }

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
            setLastStepChangeTime(Date.now());
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
        window.scrollTo(0, 0);
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 pb-24">
            {/* Stepper */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 -z-10" />
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center px-2">
                            <motion.div
                                initial={false}
                                animate={{
                                    backgroundColor: index <= currentStep ? "#2563eb" : "#e5e7eb",
                                    color: index <= currentStep ? "#ffffff" : "#6b7280",
                                    scale: index === currentStep ? 1.1 : 1
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors`}
                            >
                                {index < currentStep ? <Check size={16} /> : index + 1}
                            </motion.div>
                            <span className={`text-xs mt-2 font-medium ${index <= currentStep ? "text-primary-600" : "text-gray-500"} hidden md:block`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="md:hidden text-center mt-4 font-semibold text-gray-800">
                    {steps[currentStep].title}
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <AnimatePresence mode="wait">
                    {/* Step 1: Essentials */}
                    {currentStep === 0 && (
                        <motion.div
                            key="step1"
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">{t("basicInformation")}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("nameEn")} <span className="text-red-500">*</span></label>
                                        <input
                                            {...register("name_en", {
                                                required: true,
                                                onChange: (e) => setValue("slug", generateSlug(e.target.value))
                                            })}
                                            className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border ${errors.name_en ? 'border-red-500' : ''}`}
                                        />
                                        {errors.name_en && <span className="text-xs text-red-500">{t("errors.required", { field: t("nameEn") })}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("nameAr")}</label>
                                        <input {...register("name_ar")} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("slug")} <span className="text-red-500">*</span></label>
                                        <input placeholder="Auto-generated" {...register("slug", { required: true })} className="text-sm w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("category")} <span className="text-red-500">*</span></label>
                                        <select
                                            {...register("category_id", { required: true })}
                                            className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border ${errors.category_id ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">{t("selectCategory")}</option>
                                            {initialCategories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {i18n.language === 'ar'
                                                        ? (category.name_ar && category.name_en ? `${category.name_ar} (${category.name_en})` : (category.name_ar || category.name_en))
                                                        : (category.name_en && category.name_ar ? `${category.name_en} (${category.name_ar})` : (category.name_en || category.name_ar))}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("skinType")}</label>
                                        <input {...register("skin_type")} className="text-sm w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" placeholder={t("placeholders.skinType")} />
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("productType")}</label>
                                        <input {...register("product_type")} className="text-sm w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" placeholder={t("placeholders.productType")} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">{t("fullDescription")}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("english")}</label>
                                        <textarea {...register("description_en")} rows={6} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("arabic")}</label>
                                        <textarea {...register("description_ar")} rows={6} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">{t("highlights")}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("english")}</label>
                                        <textarea {...register("highlight_en")} rows={3} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" placeholder={t("placeholders.highlight")} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("arabic")}</label>
                                        <textarea {...register("highlight_ar")} rows={3} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" placeholder={t("placeholders.highlight")} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Media */}
                    {currentStep === 1 && (
                        <motion.div
                            key="step2"
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                                    <ImageIcon size={18} /> {t("media")}
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <AnimatePresence>
                                        {watch("image_url") && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="relative aspect-square rounded-lg overflow-hidden border-2 group border-amber-500"
                                            >
                                                <Image src={watch("image_url")} alt={t("altProduct")} className="w-full h-full object-cover" fill={true} />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setValue("image_url", "");
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </motion.div>
                                        )}
                                        {watch("gallery")?.map((url, index) => (
                                            <motion.div
                                                key={url}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="relative aspect-square rounded-lg overflow-hidden border group"
                                            >
                                                {url ? (
                                                    <Image src={url} alt={t("altProduct")} className="w-full h-full object-cover" fill={true} />
                                                ) : null}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newGallery = watch("gallery").filter((_, i) => i !== index);
                                                        setValue("gallery", newGallery);
                                                        if (watch("image_url") === url) setValue("image_url", newGallery[0] || "");
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
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
                        </motion.div>
                    )}

                    {/* Step 3: Pricing & Inventory */}
                    {currentStep === 2 && (
                        <motion.div
                            key="step3"
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl shadow-sm border p-6">
                                    <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                                        {t("inventoryPricing")}
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t("price")} ({t("EGP")})</label>
                                            <input type="text" inputMode="numeric"
                                                pattern="[0-9]*"
                                                {...register("price")} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t("stock")}</label>
                                            <input type="text" inputMode="numeric"
                                                pattern="[0-9]*"
                                                {...register("stock")} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t("discountPercentage")}</label>
                                            <input type="text" inputMode="numeric"
                                                pattern="[0-9]*"
                                                {...register("discount")} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
                                        </div>
                                    </div>
                                </div>

                                {/* Profitability Analysis */}
                                <div className="bg-white rounded-xl shadow-sm border p-6">
                                    <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                                        {t("profitability")}
                                    </h2>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">{t("sellingPrice")}:</span>
                                            <span className="font-medium">{t('{{price, currency}}', { price: watch("price") ?? 0.0 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">{t("totalMaterialCost")}:</span>
                                            <span className="font-medium text-red-600">-{t('{{price, currency}}', { price: calculateTotalCost() })}</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-800">{t("netProfit")}:</span>
                                                <span className={`font-bold ${(Number(watch("price") || 0) - Number(calculateTotalCost())) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {t('{{price, currency}}', { price: (Number(watch("price") || 0) - Number(calculateTotalCost())) })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs mt-1">
                                                <span className="text-gray-500">{t("profitMargin")}:</span>
                                                <span className={`${(Number(watch("price") || 0) > 0 ? ((Number(watch("price") || 0) - Number(calculateTotalCost())) / Number(watch("price") || 0)) * 100 : 0) >= 20 ? 'text-green-600' : 'text-orange-500'}`}>
                                                    {Number(watch("price") || 0) > 0
                                                        ? (((Number(watch("price") || 0) - Number(calculateTotalCost())) / Number(watch("price") || 0)) * 100).toFixed(1)
                                                        : 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">{t("materialsIngredients")}</h3>
                                    <div className="flex gap-2">
                                        {variantFields.length > 0 && materialFields.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm(t("confirmApplyToAll"))) {
                                                        variantFields.forEach((_, idx) => {
                                                            setValue(`variants.${idx}.materials`, materialFields);
                                                        });
                                                        toast.success(t("materialsApplied"));
                                                    }
                                                }}
                                                className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full border border-purple-200 hover:bg-purple-100 font-medium"
                                            >
                                                {t("applyToAllVariants")}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => { setActiveMaterialField('main'); setShowMaterialSelector(true); }}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                        >
                                            <Plus size={16} /> {t("addMaterial")}
                                        </button>
                                    </div>
                                </div>

                                {materialFields.length > 0 ? (
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-500">
                                                <tr>
                                                    <th className="px-4 py-2">{t("materials")}</th>
                                                    <th className="px-4 py-2 text-right">{t("amount")}</th>
                                                    <th className="px-4 py-2 text-right">{t("cost")}</th>
                                                    <th className="px-4 py-2"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                <AnimatePresence>
                                                    {materialFields.map((field: any, index) => (
                                                        <motion.tr
                                                            key={field.id}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                        >
                                                            <td className="px-4 py-2">{field.material_name || `ID: ${field.material_id}`}</td>
                                                            <td className="px-4 py-2 text-right">{field.grams_used || 0} {field.measurement_unit || 'g'}</td>
                                                            <td className="px-4 py-2 text-right">{((field.grams_used || 0) * (field.price || 0)).toFixed(2)}</td>
                                                            <td className="px-4 py-2 text-right">
                                                                <button type="button" onClick={() => removeMaterial(index)} className="text-red-500 hover:text-red-700">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                </AnimatePresence>
                                                <tr className="bg-gray-50 font-bold">
                                                    <td className="px-4 py-2" colSpan={2}>{t("totalEstimatedCost")}</td>
                                                    <td className="px-4 py-2 text-right">{t('{{price, currency}}', { price: calculateTotalCost() })}</td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic text-center py-4">{t("noMaterialsListed")}</p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Variants */}
                    {currentStep === 3 && (
                        <motion.div
                            key="step4"
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {t("variants")} <span className="text-sm font-normal text-gray-500 ml-2">(Fields here override main product details)</span>
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => appendVariant({ name_en: "", price: 0, stock: 0, gallery: [], image: "" } as any)} // Ensure 'image' is initialized
                                        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1"
                                    >
                                        <Plus size={16} /> {t("addVariant")}
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {variantFields.map((field, index) => (
                                            <motion.div
                                                key={field.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="border rounded-lg p-4 bg-gray-50 relative"
                                            >
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
                                                        <input {...register(`variants.${index}.slug` as const)} className="w-full border-gray-300 rounded shadow-sm p-1.5 border text-sm" placeholder={t("placeholders.autoGenerated")} />
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-medium text-gray-500 uppercase">{t("price")}</label>
                                                        <div className="flex items-center gap-2">
                                                            <input type="text" inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                {...register(`variants.${index}.price` as const)} className="w-full border-gray-300 rounded shadow-sm p-1.5 border text-sm" />
                                                            {watch(`variants.${index}.materials`)?.length > 0 && (
                                                                <div className="flex flex-col text-[10px] leading-tight ml-2">
                                                                    <span className="text-gray-500">{t("cost")}: {watch(`variants.${index}.materials`).reduce((acc, m) => acc + ((m.grams_used || 0) * (m.price || 0)), 0).toFixed(2)}</span>
                                                                    <span className={(Number(watch(`variants.${index}.price`) || 0) - watch(`variants.${index}.materials`).reduce((acc, m) => acc + ((m.grams_used || 0) * (m.price || 0)), 0)) >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                                                        {t("profit")}: {(Number(watch(`variants.${index}.price`) || 0) - watch(`variants.${index}.materials`).reduce((acc, m) => acc + ((m.grams_used || 0) * (m.price || 0)), 0)).toFixed(2)}
                                                                        ({(Number(watch(`variants.${index}.price`) || 0) > 0 ? ((Number(watch(`variants.${index}.price`) || 0) - watch(`variants.${index}.materials`).reduce((acc, m) => acc + ((m.grams_used || 0) * (m.price || 0)), 0)) / Number(watch(`variants.${index}.price`) || 0)) * 100 : 0).toFixed(0)}%)
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-500 uppercase">{t("stock")}</label>
                                                        <input type="text" inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            {...register(`variants.${index}.stock` as const)} className="w-full border-gray-300 rounded shadow-sm p-1.5 border text-sm" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-500 uppercase">{t("discountPercentage")}</label>
                                                        <input type="text" inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            {...register(`variants.${index}.discount` as const)} className="w-full border-gray-300 rounded shadow-sm p-1.5 border text-sm" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-500 uppercase">{t("distinguisherEnglish")}</label>
                                                        <input {...register(`variants.${index}.type_en` as const)} className="w-full border-gray-300 rounded shadow-sm p-1.5 border text-sm" placeholder={t("placeholders.distinguisher")} />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-500 uppercase">{t("distinguisherArabic")}</label>
                                                        <input {...register(`variants.${index}.type_ar` as const)} className="w-full border-gray-300 rounded shadow-sm p-1.5 border text-sm" placeholder={t("placeholders.distinguisher")} />
                                                    </div>
                                                </div>

                                                {/* Variant Gallery */}
                                                <div className="mb-4">
                                                    <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">{t("images")}</label>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {watch(`variants.${index}.image`) && ( // 👈 FIX: Check for 'image' field for main image
                                                            <motion.div
                                                                key={`main-img-${field.id}`}
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                className="relative aspect-square rounded-lg overflow-hidden border-2 group border-amber-500"
                                                            >
                                                                <Image src={watch(`variants.${index}.image`)} alt={`Product_v_${index}`} className="h-12 w-12 object-cover" fill={true} />
                                                                <input type="hidden" {...register(`variants.${index}.image` as const)} /> {/* Register field */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setValue(`variants.${index}.image`, ""); // 👈 FIX: Set the correct field
                                                                    }}
                                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                                <span className="absolute bottom-0 left-0 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-tr-lg">{t("mainImage")}</span>
                                                            </motion.div>
                                                        )}
                                                        {watch(`variants.${index}.gallery`)?.map((url, imgIndex) => (
                                                            url ? (
                                                                <Image key={imgIndex} src={url} alt={t("altVariant")} className="h-12 w-12 object-cover rounded border" fill={true} />
                                                            ) : null
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

                                                <CollapsibleSection title={t("advancedDetails")} defaultOpen={false}>
                                                    <div className="space-y-4">
                                                        {/* Description Override */}
                                                        <div>
                                                            <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">{t("descriptionOverride")}</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">{t("english")}</label>
                                                                    <textarea {...register(`variants.${index}.description_en` as const)} rows={3} className="w-full border-gray-300 rounded shadow-sm p-1.5 border text-sm" placeholder={t("placeholders.descriptionOverride")} />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">{t("arabic")}</label>
                                                                    <textarea {...register(`variants.${index}.description_ar` as const)} rows={3} className="w-full border-gray-300 rounded shadow-sm p-1.5 border text-sm" placeholder={t("placeholders.descriptionOverride")} />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <h4 className="text-xs font-bold text-gray-700 uppercase md:flex-row flex-col flex md:items-center gap-2">
                                                                    {t("materials")}
                                                                    <div className="flex items-center gap-2">
                                                                        <select
                                                                            className="text-xs border rounded px-1.5 py-0.5 font-normal text-gray-600 bg-white"
                                                                            onChange={(e) => {
                                                                                if (!e.target.value) return;

                                                                                let sourceMaterials: ProductMaterialAdminView[] = [];
                                                                                if (e.target.value === 'main') {
                                                                                    // @ts-ignore
                                                                                    sourceMaterials = materialFields;
                                                                                } else {
                                                                                    const varIndex = parseInt(e.target.value);
                                                                                    // @ts-ignore
                                                                                    sourceMaterials = watch(`variants.${varIndex}.materials`) || [];
                                                                                }

                                                                                // Clone materials nicely
                                                                                const clonedMaterials = sourceMaterials.map(m => ({
                                                                                    ...m
                                                                                }));

                                                                                setValue(`variants.${index}.materials`, clonedMaterials as any);
                                                                                e.target.value = ""; // Reset
                                                                                toast.success(t("materialsCopied"));
                                                                            }}
                                                                        >
                                                                            <option value="">{t("copyMaterialsFrom")}...</option>
                                                                            <option value="main">{t("mainProduct")}</option>
                                                                            {variantFields.map((v, vIdx) => vIdx !== index && (
                                                                                <option key={v.id} value={vIdx}>
                                                                                    {/* @ts-ignore */}
                                                                                    {v.name_en || `Variant ${vIdx + 1}`}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                </h4>
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
                                                                            <span className="font-medium text-gray-700">{mat.material_name || `ID: ${mat.id}`}</span>
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
                                                                    {t("noMaterialsForVariant")}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CollapsibleSection>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {variantFields.length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-4 border-2 border-dashed rounded-lg">
                                            {t("noVariantsAdded")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 5: Extra Details */}
                    {currentStep === 4 && (
                        <motion.div
                            key="step5"
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">{t("stepExtras")}</h2>
                                <div className="space-y-6">


                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">{t("bestFor")}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <textarea {...register("faq_en.best_for")} placeholder="English..." rows={3} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" />
                                            <textarea {...register("faq_ar.best_for")} placeholder="Arabic..." rows={3} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">{t("precautions")}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <textarea {...register("faq_en.precautions")} placeholder="English..." rows={3} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" />
                                            <textarea {...register("faq_ar.precautions")} placeholder="Arabic..." rows={3} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40 flex justify-between items-center max-w-5xl mx-auto w-full shadow-lg md:shadow-none md:relative md:bg-transparent md:border-t-0 md:p-0 md:mt-8">
                    <button
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${currentStep === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        <ChevronLeft size={20} className="mr-1" />
                        {t("previous")}
                    </button>

                    {currentStep < steps.length - 1 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-colors"
                        >
                            {t("next")}
                            <ChevronRight size={20} className="ml-1" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md transition-colors"
                        >
                            {t("finish")}
                            <Check size={20} className="ml-1" />
                        </button>
                    )}
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
