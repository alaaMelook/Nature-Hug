"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { BundleAdminView, BundleItemView } from "@/domain/entities/views/admin/bundleAdminView";
import { Category } from "@/domain/entities/database/category";
import { ImageSelector } from "@/ui/components/admin/imageSelector";
import { createBundleAction, updateBundleAction } from "@/ui/hooks/admin/bundles";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Trash2, Plus, Image as ImageIcon, Box, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CreateBundleFormProps {
    initialImages: { image: any; url: string }[];
    initialCategories: Category[];
    editMode?: boolean;
    initialBundle?: BundleAdminView;
}

const CollapsibleSection = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border rounded-xl mb-4 overflow-hidden bg-white shadow-xs">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-5 py-4 bg-gray-50/50 flex justify-between items-center hover:bg-gray-50 transition-colors border-b"
            >
                <span className="font-bold text-gray-800 text-sm tracking-wide">{title}</span>
                {isOpen ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
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
                        <div className="p-5">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export function CreateBundleForm({ initialImages, initialCategories, editMode = false, initialBundle }: CreateBundleFormProps) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [showImageSelector, setShowImageSelector] = useState(false);
    
    // Lazy loaded products for category
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
    const [productSearch, setProductSearch] = useState("");
    
    // Map of product ID to variants
    const [productVariantsMap, setProductVariantsMap] = useState<Record<number, any[]>>({});
    const [loadingVariantsMap, setLoadingVariantsMap] = useState<Record<number, boolean>>({});

    const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<BundleAdminView>({
        defaultValues: editMode && initialBundle ? {
            ...initialBundle,
            rules: initialBundle.rules || {},
            items: initialBundle.items || []
        } : {
            status: 'draft',
            bundle_type: 'fixed',
            pricing_type: 'fixed_price',
            discount_value: 0,
            fixed_price: 0,
            featured: false,
            visible_home: false,
            visible_category: false,
            visible_bundle_collection: true,
            display_order: 0,
            rules: {
                min_quantity: 1,
                max_quantity: 10,
                allow_duplicate_products: false,
                allow_duplicate_variants: false,
                max_variants_per_product: 1
            },
            items: []
        }
    });

    const { fields: itemFields, append: appendItem, remove: removeItem, replace: replaceItems } = useFieldArray({
        control,
        name: "items"
    });

    const bundleType = watch("bundle_type");
    const pricingType = watch("pricing_type");
    const discountValue = Number(watch("discount_value") || 0);
    const fixedPrice = Number(watch("fixed_price") || 0);
    const bundleImage = watch("image");
    const watchedItems = watch("items") || [];

    // Automatically generate slug from name
    const bundleName = watch("name");
    useEffect(() => {
        if (!editMode && bundleName) {
            const cleanSlug = bundleName
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "") // remove non-alphanumeric except hyphen/space
                .replace(/[\s_]+/g, "-") // replace spaces/underscores with hyphen
                .replace(/^-+|-+$/g, ""); // remove leading/trailing hyphens
            setValue("slug", cleanSlug);
        }
    }, [bundleName, editMode, setValue]);

    // Load all products on mount
    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingProducts(true);
            try {
                const res = await fetch(`/api/admin/bundles/products`);
                if (res.ok) {
                    const data = await res.json();
                    setCategoryProducts(data || []);
                } else {
                    toast.error("Failed to load products");
                }
            } catch (err) {
                console.error("Error fetching products:", err);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, []);

    // Load products variants if any selected product has variants
    const lazyFetchVariants = async (productId: number) => {
        if (productVariantsMap[productId] || loadingVariantsMap[productId]) return;

        setLoadingVariantsMap(prev => ({ ...prev, [productId]: true }));
        try {
            const res = await fetch(`/api/admin/bundles/products/${productId}/variants`);
            if (res.ok) {
                const data = await res.json();
                setProductVariantsMap(prev => ({ ...prev, [productId]: data || [] }));
            }
        } catch (err) {
            console.error(`Error loading variants for product ${productId}:`, err);
        } finally {
            setLoadingVariantsMap(prev => ({ ...prev, [productId]: false }));
        }
    };

    // Trigger fetching variants when category products load in edit mode
    useEffect(() => {
        if (editMode && initialBundle?.items) {
            initialBundle.items.forEach(item => {
                lazyFetchVariants(item.product_id);
            });
        }
    }, [editMode, initialBundle]);

    // Filter product selection display
    const filteredProducts = useMemo(() => {
        return categoryProducts.filter(p => 
            p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
            (p.name_ar && p.name_ar.toLowerCase().includes(productSearch.toLowerCase()))
        );
    }, [categoryProducts, productSearch]);

    // Check if a product is selected
    const isProductSelected = (productId: number) => {
        return watchedItems.some(item => item.product_id === productId);
    };

    // Handle product selection toggle
    const handleProductToggle = async (product: any) => {
        const isSelected = isProductSelected(product.id);
        
        if (isSelected) {
            // Remove items for this product
            const indicesToRemove = watchedItems
                .map((item, idx) => item.product_id === product.id ? idx : -1)
                .filter(idx => idx !== -1);
            
            // Remove from highest to lowest index to avoid offset issues
            indicesToRemove.sort((a, b) => b - a).forEach(idx => removeItem(idx));
        } else {
            // Load variants first to see if we need to select variants
            await lazyFetchVariants(product.id);
            
            // Add item
            appendItem({
                id: 0,
                bundle_id: 0,
                product_id: product.id,
                variant_id: null,
                quantity: 1,
                notes: "",
                sort_order: watchedItems.length,
                product_name_en: product.name,
                product_name_ar: product.name_ar || product.name,
                product_image: product.image_url || "",
                price: product.price || 0,
                discount: product.discount || 0,
                stock: product.stock || 0
            });
        }
    };

    // Handle variant toggle inside product
    const handleVariantToggle = (product: any, variant: any) => {
        const existingIdx = watchedItems.findIndex(item => item.product_id === product.id && item.variant_id === variant.id);

        if (existingIdx !== -1) {
            // Remove specific variant
            removeItem(existingIdx);
        } else {
            // Add specific variant
            appendItem({
                id: 0,
                bundle_id: 0,
                product_id: product.id,
                variant_id: variant.id,
                quantity: 1,
                notes: "",
                sort_order: watchedItems.length,
                product_name_en: product.name,
                product_name_ar: product.name_ar || product.name,
                product_image: product.image_url || "",
                variant_name_en: variant.name_en,
                variant_name_ar: variant.name_ar || variant.name_en,
                variant_image: variant.image || "",
                price: variant.price || product.price || 0,
                discount: variant.discount || 0,
                stock: variant.stock || 0
            });

            // If there's a base product entry with variant_id === null, remove it
            const baseIdx = watchedItems.findIndex(item => item.product_id === product.id && item.variant_id === null);
            if (baseIdx !== -1) {
                removeItem(baseIdx);
            }
        }
    };

    // Calculate Pricing values live
    const pricingStats = useMemo(() => {
        const original_total = watchedItems.reduce((sum, item) => {
            return sum + (Number(item.price || 0) * Number(item.quantity || 1));
        }, 0);

        let discount = 0;
        let final_price = original_total;

        if (pricingType === 'fixed_price') {
            final_price = fixedPrice;
            discount = Math.max(0, original_total - final_price);
        } else if (pricingType === 'percentage_discount') {
            discount = original_total * (discountValue / 100);
            final_price = Math.max(0, original_total - discount);
        } else if (pricingType === 'fixed_amount_discount') {
            discount = discountValue;
            final_price = Math.max(0, original_total - discount);
        }

        return { original_total, discount, final_price };
    }, [watchedItems, pricingType, discountValue, fixedPrice]);

    // Form submission
    const onSubmit = async (data: BundleAdminView) => {
        if (data.items.length === 0) {
            toast.error(i18n.language === 'ar' ? "يجب اختيار منتج واحد على الأقل للباقة" : "Please select at least one product for the bundle");
            return;
        }

        // Validate prices
        if (pricingStats.final_price < 0) {
            toast.error(i18n.language === 'ar' ? "سعر الباقة لا يمكن أن يكون سالباً" : "Bundle price cannot be negative");
            return;
        }

        const bundlePayload = {
            ...data,
            discount_value: discountValue,
            fixed_price: fixedPrice,
            display_order: Number(data.display_order || 0),
            rules: {
                ...data.rules,
                min_quantity: Number(data.rules?.min_quantity || 1),
                max_quantity: Number(data.rules?.max_quantity || 10),
                max_variants_per_product: Number(data.rules?.max_variants_per_product || 1)
            }
        };

        let result;
        if (editMode && initialBundle?.id) {
            result = await updateBundleAction({ ...bundlePayload, id: initialBundle.id });
        } else {
            result = await createBundleAction(bundlePayload);
        }

        if (result.success) {
            toast.success(editMode ? 
                (i18n.language === 'ar' ? "تم تعديل الباقة بنجاح" : "Bundle updated successfully") : 
                (i18n.language === 'ar' ? "تم إنشاء الباقة بنجاح" : "Bundle created successfully")
            );
            router.push("/admin/products/bundles");
        } else {
            toast.error(result.error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {editMode ? (i18n.language === 'ar' ? 'تعديل الباقة' : 'Edit Bundle') : (i18n.language === 'ar' ? 'إنشاء باقة جديدة' : 'Create Bundle')}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {editMode ? (i18n.language === 'ar' ? 'تعديل بيانات الباقة الحالية' : 'Modify current bundle configurations') : (i18n.language === 'ar' ? 'تحديد خيارات الباقة والمنتجات وقواعد الاختيار' : 'Define new package options, items, and rules')}
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => router.push("/admin/products/bundles")}
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg bg-white hover:bg-gray-50 transition-colors w-1/2 sm:w-auto text-center"
                    >
                        {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors w-1/2 sm:w-auto"
                    >
                        {editMode ? (i18n.language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (i18n.language === 'ar' ? 'إنشاء الباقة' : 'Create Bundle')}
                    </button>
                </div>
            </div>

            {/* Section 1 — Basic Information */}
            <CollapsibleSection title={i18n.language === 'ar' ? '1. معلومات الباقة الأساسية' : '1. Basic Information'}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.language === 'ar' ? 'اسم الباقة *' : 'Bundle Name *'}</label>
                            <input
                                type="text"
                                className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder={i18n.language === 'ar' ? 'مثال: باقة العناية بالشعر التالف' : 'e.g. Hair Care Rescue Kit'}
                                {...register("name", { required: true })}
                            />
                            {errors.name && <span className="text-xs text-red-500 mt-1 block">{i18n.language === 'ar' ? 'الاسم مطلوب' : 'Name is required'}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.language === 'ar' ? 'الرابط الفريد (Slug) *' : 'Slug *'}</label>
                            <input
                                type="text"
                                className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none ${errors.slug ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="hair-care-rescue-kit"
                                {...register("slug", { required: true })}
                            />
                            {errors.slug && <span className="text-xs text-red-500 mt-1 block">{i18n.language === 'ar' ? 'الرابط الفريد مطلوب' : 'Slug is required'}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.language === 'ar' ? 'الوصف' : 'Description'}</label>
                            <textarea
                                rows={4}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                placeholder={i18n.language === 'ar' ? 'اكتب تفاصيل ومزايا الباقة...' : 'Write detailed bundle description here...'}
                                {...register("description")}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Status */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.language === 'ar' ? 'حالة الباقة' : 'Bundle Status'}</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['draft', 'active', 'hidden'].map((statusOption) => (
                                    <label
                                        key={statusOption}
                                        className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer text-xs font-semibold uppercase tracking-wider transition-all select-none ${
                                            watch("status") === statusOption 
                                                ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-500/20' 
                                                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            value={statusOption}
                                            className="hidden"
                                            {...register("status")}
                                        />
                                        <span>
                                            {statusOption === 'draft' ? (i18n.language === 'ar' ? 'مسودة' : 'Draft') : 
                                             statusOption === 'active' ? (i18n.language === 'ar' ? 'نشط' : 'Active') : 
                                             (i18n.language === 'ar' ? 'مخفي' : 'Hidden')}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Image Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.language === 'ar' ? 'صورة الباقة' : 'Bundle Image'}</label>
                            <div className="border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center min-h-[160px] relative bg-gray-50/50">
                                {bundleImage ? (
                                    <div className="relative w-full h-[140px] rounded-lg overflow-hidden group">
                                        <Image src={bundleImage} alt="" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <button
                                                type="button"
                                                onClick={() => setValue("image", undefined)}
                                                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowImageSelector(true)}
                                        className="flex flex-col items-center text-gray-400 hover:text-primary-600 transition-colors"
                                    >
                                        <ImageIcon size={32} className="mb-2" />
                                        <span className="text-xs font-semibold">{i18n.language === 'ar' ? 'اختر صورة للباقة' : 'Select Bundle Image'}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Section 2 — Category selection */}
            <CollapsibleSection title={i18n.language === 'ar' ? '2. القسم الرئيسي للباقة' : '2. Bundle Category'}>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.language === 'ar' ? 'القسم *' : 'Category *'}</label>
                    <select
                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white ${errors.category_id ? 'border-red-500' : 'border-gray-300'}`}
                        {...register("category_id", { required: true, valueAsNumber: true })}
                    >
                        <option value="">{i18n.language === 'ar' ? '-- اختر القسم --' : '-- Choose Category --'}</option>
                        {initialCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {i18n.language === 'ar' ? c.name_ar : c.name_en}
                            </option>
                        ))}
                    </select>
                    {errors.category_id && <span className="text-xs text-red-500 mt-1 block">{i18n.language === 'ar' ? 'القسم مطلوب لتصفية منتجات الباقة' : 'Category is required to filter products'}</span>}
                </div>
            </CollapsibleSection>

            {/* Section 3 — Bundle Type */}
            <CollapsibleSection title={i18n.language === 'ar' ? '3. نوع الباقة' : '3. Bundle Type'}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { 
                            value: 'fixed', 
                            title: i18n.language === 'ar' ? 'باقة ثابتة' : 'Fixed Bundle', 
                            desc: i18n.language === 'ar' ? 'يتم تحديد منتجات الباقة بدقة متناهية من قبل الإدارة.' : 'Admin defines exactly which items form the bundle.' 
                        },
                        { 
                            value: 'build_your_own', 
                            title: i18n.language === 'ar' ? 'اصنع باقتك' : 'Build Your Own Bundle', 
                            desc: i18n.language === 'ar' ? 'يختار العميل منتجاته بنفسه بناءً على القواعد والشروط المحددة.' : 'Customer selects products from the list according to rules.' 
                        },
                        { 
                            value: 'mix_and_match', 
                            title: i18n.language === 'ar' ? 'تنسيق وتوفيق' : 'Mix & Match', 
                            desc: i18n.language === 'ar' ? 'يختار العميل المنتجات والخيارات بمقادير محددة.' : 'Customer selects products/variants up to a certain total limit.' 
                        }
                    ].map((typeOption) => (
                        <label
                            key={typeOption.value}
                            className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all select-none ${
                                bundleType === typeOption.value 
                                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20 text-primary-900' 
                                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                            <input
                                type="radio"
                                value={typeOption.value}
                                className="hidden"
                                {...register("bundle_type")}
                            />
                            <span className="font-bold text-sm mb-1">{typeOption.title}</span>
                            <span className="text-xs text-gray-500 leading-relaxed">{typeOption.desc}</span>
                        </label>
                    ))}
                </div>
            </CollapsibleSection>

            {/* Section 4 — Product Selection & Section 5 — Variant Selection */}
            <CollapsibleSection title={i18n.language === 'ar' ? '4. اختيار المنتجات والخيارات الفرعية' : '4. Product & Variant Selection'}>
                    <div className="space-y-4">
                        {/* Local Products Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={i18n.language === 'ar' ? 'البحث عن منتج...' : 'Search products...'}
                                className="w-full pl-3 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                            />
                        </div>

                        {loadingProducts ? (
                            <div className="text-center py-6 text-xs text-gray-400">{i18n.language === 'ar' ? 'جاري تحميل المنتجات...' : 'Loading products...'}</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-6 text-xs text-gray-400">{i18n.language === 'ar' ? 'لا توجد منتجات مطابقة في هذا القسم.' : 'No products found in this category.'}</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
                                {filteredProducts.map((p) => {
                                    const isSelected = isProductSelected(p.id);
                                    const variants = productVariantsMap[p.id] || [];
                                    const hasVariants = variants.length > 0;
                                    const isLoadingVariants = loadingVariantsMap[p.id];
                                    
                                    return (
                                        <div 
                                            key={p.id} 
                                            className={`border rounded-xl p-3 transition-all ${isSelected ? 'border-primary-400 bg-primary-10/50' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 bg-gray-100 border rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        {p.image_url ? (
                                                            <Image src={p.image_url} alt="" fill className="object-cover" />
                                                        ) : (
                                                            <Box className="w-5 h-5 text-gray-300" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-900">{i18n.language === 'ar' ? p.name_ar : p.name}</div>
                                                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">{p.price.toFixed(2)} EGP • Stock: {p.stock}</div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleProductToggle(p)}
                                                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${isSelected ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                                >
                                                    {isSelected ? (i18n.language === 'ar' ? 'تم الاختيار' : 'Selected') : (i18n.language === 'ar' ? 'تحديد' : 'Select')}
                                                </button>
                                            </div>

                                            {/* Sub-Variants List */}
                                            {isSelected && (
                                                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                        {i18n.language === 'ar' ? 'الخيارات والأنواع المتاحة:' : 'Scents / Variants Available:'}
                                                    </div>
                                                    {isLoadingVariants ? (
                                                        <div className="text-[10px] text-gray-400">{i18n.language === 'ar' ? 'جاري التحميل...' : 'Loading variants...'}</div>
                                                    ) : !hasVariants ? (
                                                        <div className="text-[10px] text-gray-400 italic">{i18n.language === 'ar' ? 'لا يوجد أنواع فرعية لهذا المنتج.' : 'No variants available.'}</div>
                                                    ) : (
                                                        <div className="space-y-1.5">
                                                            {variants.map((v) => {
                                                                const isVarSelected = watchedItems.some(item => item.product_id === p.id && item.variant_id === v.id);
                                                                return (
                                                                    <label key={v.id} className="flex items-center justify-between p-1.5 rounded hover:bg-gray-50 cursor-pointer text-xs select-none">
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isVarSelected}
                                                                                onChange={() => handleVariantToggle(p, v)}
                                                                                className="rounded text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
                                                                            />
                                                                            <span className="font-semibold text-gray-700">
                                                                                {i18n.language === 'ar' ? v.name_ar : v.name_en}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-[10px] text-gray-400 font-mono">{(v.price || p.price).toFixed(2)} EGP</span>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Selected Items Config List */}
                        {watchedItems.length > 0 && (
                            <div className="mt-4 pt-4 border-t space-y-3">
                                <div className="text-xs font-bold text-gray-700">{i18n.language === 'ar' ? 'المنتجات والكميات المختارة حالياً:' : 'Configured Bundle Items:'}</div>
                                <div className="space-y-2">
                                    {itemFields.map((field, index) => {
                                        const item = watchedItems[index] || {};
                                        return (
                                            <div key={field.id} className="bg-gray-50 border rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                                                <div>
                                                    <div className="font-bold text-gray-900">
                                                        {i18n.language === 'ar' ? item.product_name_ar : item.product_name_en}
                                                    </div>
                                                    {item.variant_id && (
                                                        <div className="text-[10px] text-primary-700 font-semibold mt-0.5">
                                                            {i18n.language === 'ar' ? `النوع: ${item.variant_name_ar}` : `Variant: ${item.variant_name_en}`}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 justify-between md:justify-end">
                                                    {/* Quantity input */}
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-gray-500 text-[10px]">{i18n.language === 'ar' ? 'الكمية:' : 'Qty:'}</span>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            className="w-14 p-1 border rounded text-center font-bold bg-white"
                                                            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                        />
                                                    </div>

                                                    {/* Optional Notes */}
                                                    <input
                                                        type="text"
                                                        placeholder={i18n.language === 'ar' ? 'ملاحظات اختيارية...' : 'Optional notes...'}
                                                        className="p-1 border rounded bg-white text-[11px] w-28 md:w-36"
                                                        {...register(`items.${index}.notes`)}
                                                    />

                                                    {/* Remove Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
            </CollapsibleSection>

            {/* Section 6 — Bundle Pricing */}
            <CollapsibleSection title={i18n.language === 'ar' ? '5. تسعير الباقة' : '5. Bundle Pricing'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.language === 'ar' ? 'طريقة التسعير' : 'Pricing Type'}</label>
                            <div className="space-y-2">
                                {[
                                    { value: 'fixed_price', label: i18n.language === 'ar' ? 'سعر باقة ثابت ومحدد' : 'Fixed Price Override' },
                                    { value: 'percentage_discount', label: i18n.language === 'ar' ? 'خصم مئوي من إجمالي المنتجات' : 'Percentage Discount' },
                                    { value: 'fixed_amount_discount', label: i18n.language === 'ar' ? 'خصم مبلغ ثابت من الإجمالي' : 'Fixed Amount Discount' }
                                ].map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-xs select-none">
                                        <input
                                            type="radio"
                                            value={opt.value}
                                            className="text-primary-600 focus:ring-primary-500 h-4 w-4"
                                            {...register("pricing_type")}
                                        />
                                        <span className="font-semibold text-gray-700">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {pricingType === 'fixed_price' ? (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.language === 'ar' ? 'سعر الباقة النهائي *' : 'Final Bundle Price *'}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg pr-12 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        placeholder="0.00"
                                        {...register("fixed_price")}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 font-mono">EGP</span>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    {pricingType === 'percentage_discount' 
                                        ? (i18n.language === 'ar' ? 'نسبة الخصم المئوية *' : 'Discount Percentage *') 
                                        : (i18n.language === 'ar' ? 'قيمة الخصم المالي *' : 'Discount Amount *')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={0}
                                        step={pricingType === 'percentage_discount' ? 1 : 0.01}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg pr-12 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        placeholder="0"
                                        {...register("discount_value")}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 font-mono">
                                        {pricingType === 'percentage_discount' ? '%' : 'EGP'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 border rounded-xl p-5 flex flex-col justify-center space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">{i18n.language === 'ar' ? 'إجمالي المنتجات الأصلي:' : 'Original Total:'}</span>
                            <span className="font-bold text-gray-800 font-mono">{pricingStats.original_total.toFixed(2)} EGP</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">{i18n.language === 'ar' ? 'قيمة الخصم التقريبية:' : 'Discount Value:'}</span>
                            <span className="font-bold text-red-600 font-mono">-{pricingStats.discount.toFixed(2)} EGP</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between items-center text-base font-bold">
                            <span className="text-gray-900">{i18n.language === 'ar' ? 'سعر الباقة النهائي للمستهلك:' : 'Final Bundle Price:'}</span>
                            <span className="text-primary-700 text-lg font-mono">{pricingStats.final_price.toFixed(2)} EGP</span>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Section 7 — Bundle Rules */}
            <CollapsibleSection title={i18n.language === 'ar' ? '6. قواعد وشروط الباقة' : '6. Bundle Rules'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.language === 'ar' ? 'الحد الأدنى للمنتجات المطلوبة' : 'Minimum Required Items'}</label>
                            <input
                                type="number"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                {...register("rules.min_quantity")}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.language === 'ar' ? 'الحد الأقصى للمنتجات المطلوبة' : 'Maximum Allowed Items'}</label>
                            <input
                                type="number"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                {...register("rules.max_quantity")}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.language === 'ar' ? 'الحد الأقصى لتكرار نفس المنتج' : 'Max Duplicate Products'}</label>
                            <input
                                type="number"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                {...register("rules.max_variants_per_product")}
                            />
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                                <input
                                    type="checkbox"
                                    className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                                    {...register("rules.allow_duplicate_products")}
                                />
                                <span className="font-semibold text-gray-700">{i18n.language === 'ar' ? 'السماح للعميل بتكرار نفس المنتج بالباقة' : 'Allow duplicate products'}</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                                <input
                                    type="checkbox"
                                    className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                                    {...register("rules.allow_duplicate_variants")}
                                />
                                <span className="font-semibold text-gray-700">{i18n.language === 'ar' ? 'السماح للعميل بتكرار نفس النوع/الرائحة' : 'Allow duplicate variants'}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Section 8 — Visibility */}
            <CollapsibleSection title={i18n.language === 'ar' ? '7. خيارات العرض والظهور للمتجر' : '7. Visibility Options'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 pt-2">
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                            <input
                                type="checkbox"
                                className="rounded text-primary-600 focus:ring-primary-500 h-4.5 w-4.5"
                                {...register("featured")}
                            />
                            <span className="font-bold text-gray-700">{i18n.language === 'ar' ? 'باقة مميزة (Featured)' : 'Featured Bundle'}</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                            <input
                                type="checkbox"
                                className="rounded text-primary-600 focus:ring-primary-500 h-4.5 w-4.5"
                                {...register("visible_home")}
                            />
                            <span className="font-bold text-gray-700">{i18n.language === 'ar' ? 'عرض في الصفحة الرئيسية للمتجر' : 'Show on Homepage'}</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                            <input
                                type="checkbox"
                                className="rounded text-primary-600 focus:ring-primary-500 h-4.5 w-4.5"
                                {...register("visible_category")}
                            />
                            <span className="font-bold text-gray-700">{i18n.language === 'ar' ? 'عرض في صفحات الأقسام والمنتجات' : 'Show in Category Page'}</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                            <input
                                type="checkbox"
                                className="rounded text-primary-600 focus:ring-primary-500 h-4.5 w-4.5"
                                {...register("visible_bundle_collection")}
                            />
                            <span className="font-bold text-gray-700">{i18n.language === 'ar' ? 'عرض في صفحة عروض الباقات المخصصة' : 'Show in Bundle Collection'}</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.language === 'ar' ? 'رقم الترتيب في العرض' : 'Display Order'}</label>
                        <input
                            type="number"
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            placeholder="0"
                            {...register("display_order")}
                        />
                    </div>
                </div>
            </CollapsibleSection>

            {/* Image Selector Modal */}
            {showImageSelector && (
                <ImageSelector
                    images={initialImages}
                    onSelect={(url) => setValue("image", url)}
                    selectedUrl={bundleImage}
                    onClose={() => setShowImageSelector(false)}
                />
            )}
        </form>
    );
}
