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
import { ChevronDown, ChevronUp, Trash2, Plus, Image as ImageIcon, Box, Check, Lock, Sparkles, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CreateBundleFormProps {
    initialImages: { image: any; url: string }[];
    initialCategories: Category[];
    editMode?: boolean;
    initialBundle?: BundleAdminView;
}

// Reusable Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, color = 'primary' }: { checked: boolean; onChange: (v: boolean) => void; color?: 'violet' | 'amber' | 'primary' }) => {
    const colors: Record<string, string> = {
        violet: checked ? 'bg-violet-600' : 'bg-gray-300',
        amber: checked ? 'bg-amber-500' : 'bg-gray-300',
        primary: checked ? 'bg-primary-600' : 'bg-gray-300',
    };
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            style={{ width: 40, height: 22, flexShrink: 0 }}
            className={`relative rounded-full transition-colors duration-200 ${colors[color]}`}
        >
            <span
                style={{
                    position: 'absolute',
                    top: 3,
                    left: checked ? 20 : 3,
                    width: 16,
                    height: 16,
                    transition: 'left 0.2s',
                }}
                className="rounded-full bg-white shadow"
            />
        </button>
    );
};

const CollapsibleSection = ({ step, title, subtitle, children, defaultOpen = true }: { step?: number, title: string, subtitle?: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-100 rounded-3xl mb-6 overflow-hidden bg-white shadow-xs transition-all duration-300 hover:shadow-md"
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4.5 bg-gradient-to-r from-gray-50/90 via-white to-gray-50/50 flex justify-between items-center hover:bg-gray-50 transition-colors border-b border-gray-100/80 cursor-pointer"
            >
                <div className="flex items-center gap-3.5 text-left">
                    {step && (
                        <div className="w-8 h-8 rounded-xl bg-primary-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs font-mono">
                            {step}
                        </div>
                    )}
                    <div>
                        <span className="font-extrabold text-gray-900 text-sm tracking-tight font-cairo block">{title}</span>
                        {subtitle && <span className="text-[11px] text-gray-400 font-cairo block mt-0.5">{subtitle}</span>}
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100/80 flex items-center justify-center text-gray-500 transition-transform duration-200">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 font-cairo">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
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

    // Calculate Pricing values live with Financial Metrics (Gross Margin %, Net Profit Estimate, Discount %)
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

        const discount_percent = original_total > 0 ? (discount / original_total) * 100 : 0;
        // Gross Margin %: Ratio of bundle price kept compared to original total
        const gross_margin_percent = original_total > 0 ? (final_price / original_total) * 100 : 100;
        
        // Net Profit Estimate: Assuming standard 40% COGS base cost
        const estimated_cogs = original_total * 0.40;
        const net_profit = Math.max(0, final_price - estimated_cogs);
        const net_margin_percent = final_price > 0 ? (net_profit / final_price) * 100 : 0;

        return {
            original_total,
            discount,
            final_price,
            discount_percent,
            gross_margin_percent,
            estimated_cogs,
            net_profit,
            net_margin_percent
        };
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl mx-auto pb-16 font-cairo">
            {/* Form Top Navigation Bar */}
            <div className="bg-white/80 backdrop-blur-md sticky top-4 z-40 p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {editMode ? (i18n.language === 'ar' ? 'تعديل باقة' : 'Edit Mode') : (i18n.language === 'ar' ? 'باقة جديدة' : 'New Bundle')}
                        </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1">
                        {editMode ? (i18n.language === 'ar' ? 'تعديل بيانات الباقة' : 'Edit Bundle Details') : (i18n.language === 'ar' ? 'إنشاء باقة جديدة' : 'Create New Bundle')}
                    </h1>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => router.push("/admin/products/bundles")}
                        className="px-5 py-2.5 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl bg-white hover:bg-gray-50 transition-all w-1/2 sm:w-auto text-center cursor-pointer"
                    >
                        {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-primary-800 hover:bg-primary-900 text-white text-xs font-bold rounded-xl transition-all w-1/2 sm:w-auto cursor-pointer shadow-sm hover:shadow"
                    >
                        {editMode ? (i18n.language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (i18n.language === 'ar' ? 'إنشاء الباقة' : 'Create Bundle')}
                    </button>
                </div>
            </div>

            {/* Section 1 — Basic Information */}
            <CollapsibleSection
                step={1}
                title={i18n.language === 'ar' ? 'معلومات الباقة الأساسية' : 'Basic Information'}
                subtitle={i18n.language === 'ar' ? 'الاسم، الوصف، الرابط والحالة' : 'Name, description, slug and status'}
            >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="sm:col-span-2 space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">{i18n.language === 'ar' ? 'اسم الباقة *' : 'Bundle Name *'}</label>
                            <input
                                type="text"
                                className={`w-full p-3 bg-gray-50/50 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all ${errors.name ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200'}`}
                                placeholder={i18n.language === 'ar' ? 'مثال: باقة العناية الكاملة للشعر' : 'e.g. Hair Care Rescue Kit'}
                                {...register("name", { required: true })}
                            />
                            {errors.name && <span className="text-[11px] text-red-500 font-semibold mt-1 block">{i18n.language === 'ar' ? 'الاسم مطلوب' : 'Name is required'}</span>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">{i18n.language === 'ar' ? 'الرابط الفريد (Slug) *' : 'Slug *'}</label>
                            <input
                                type="text"
                                className={`w-full p-3 bg-gray-50/50 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all ${errors.slug ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200'}`}
                                placeholder="hair-care-rescue-kit"
                                {...register("slug", { required: true })}
                            />
                            {errors.slug && <span className="text-[11px] text-red-500 font-semibold mt-1 block">{i18n.language === 'ar' ? 'الرابط الفريد مطلوب' : 'Slug is required'}</span>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">{i18n.language === 'ar' ? 'الوصف التفصيلي' : 'Description'}</label>
                            <textarea
                                rows={4}
                                className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all"
                                placeholder={i18n.language === 'ar' ? 'اكتب تفاصيل ومزايا الباقة للعميل...' : 'Write detailed bundle description here...'}
                                {...register("description")}
                            />
                        </div>
                    </div>

                    <div className="space-y-5">
                        {/* Status */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">{i18n.language === 'ar' ? 'حالة الباقة' : 'Bundle Status'}</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['draft', 'active', 'hidden'].map((statusOption) => {
                                    const isSel = watch("status") === statusOption;
                                    return (
                                        <label
                                            key={statusOption}
                                            className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer text-xs font-bold uppercase transition-all select-none ${
                                                isSel 
                                                    ? statusOption === 'active' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200' :
                                                      statusOption === 'hidden' ? 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-200' :
                                                      'border-gray-500 bg-gray-100 text-gray-800'
                                                    : 'border-gray-200 hover:bg-gray-50 text-gray-500'
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
                                    );
                                })}
                            </div>
                        </div>

                        {/* Image Selector */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">{i18n.language === 'ar' ? 'صورة الباقة' : 'Bundle Image'}</label>
                            <div className="border border-dashed border-gray-300 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[160px] relative bg-gray-50/40 hover:bg-gray-50/80 transition-colors">
                                {bundleImage ? (
                                    <div className="relative w-full h-[140px] rounded-xl overflow-hidden group shadow-2xs">
                                        <Image src={bundleImage} alt="" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <button
                                                type="button"
                                                onClick={() => setValue("image", undefined)}
                                                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-md cursor-pointer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowImageSelector(true)}
                                        className="flex flex-col items-center text-gray-400 hover:text-primary-800 transition-colors cursor-pointer"
                                    >
                                        <ImageIcon size={32} className="mb-2 stroke-1" />
                                        <span className="text-xs font-bold">{i18n.language === 'ar' ? 'اختر صورة من المعرض' : 'Select Image from Library'}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Section 2 — Category selection */}
            <CollapsibleSection
                step={2}
                title={i18n.language === 'ar' ? 'القسم الرئيسي للباقة' : 'Bundle Category'}
                subtitle={i18n.language === 'ar' ? 'اختر القسم الذي تنتمي إليه الباقة' : 'Select category'}
            >
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">{i18n.language === 'ar' ? 'القسم *' : 'Category *'}</label>
                    <select
                        className={`w-full p-3 bg-gray-50/50 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all ${errors.category_id ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200'}`}
                        {...register("category_id", { required: true, valueAsNumber: true })}
                    >
                        <option value="">{i18n.language === 'ar' ? '-- اختر القسم --' : '-- Choose Category --'}</option>
                        {initialCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {i18n.language === 'ar' ? c.name_ar : c.name_en}
                            </option>
                        ))}
                    </select>
                    {errors.category_id && <span className="text-[11px] text-red-500 font-semibold mt-1 block">{i18n.language === 'ar' ? 'القسم مطلوب لتصفية منتجات الباقة' : 'Category is required to filter products'}</span>}
                </div>
            </CollapsibleSection>

            {/* Section 3 — Bundle Type */}
            <CollapsibleSection
                step={3}
                title={i18n.language === 'ar' ? 'نوع وقواعد الباقة' : 'Bundle Type & Rules'}
                subtitle={i18n.language === 'ar' ? 'اختر طريقة تخصيص العميل للباقة' : 'Choose how customers interact with this bundle'}
            >
                <div className="space-y-4">
                    {/* Type selection cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {([
                            {
                                value: 'fixed',
                                icon: <Lock size={22} />,
                                title: i18n.language === 'ar' ? 'باقة ثابتة' : 'Fixed Bundle',
                                short: i18n.language === 'ar' ? 'محتوى الباقة محدد سلفاً' : 'Content is pre-set',
                                desc: i18n.language === 'ar'
                                    ? 'تحدد الإدارة المنتجات والكميات الثابتة التي تُشكّل الباقة. لا يمكن للعميل تعديل مكوناتها — يضيفها كما هي للسلة مباشرةً.'
                                    : 'Admin defines the exact products and quantities. Customers cannot change the contents — they add it to cart as-is.',
                                color: 'blue'
                            },
                            {
                                value: 'build_your_own',
                                icon: <Sparkles size={22} />,
                                title: i18n.language === 'ar' ? 'اصنع باقتك' : 'Build Your Own',
                                short: i18n.language === 'ar' ? 'العميل يختار نوع/رائحة كل منتج' : 'Customer picks variants per slot',
                                desc: i18n.language === 'ar'
                                    ? 'تضع الإدارة قائمة المنتجات وكمية كل منتج. لكل وحدة slot يختار العميل النوع/الرائحة المناسبة من الخيارات المتاحة. مثال: 3 شامبو — يختار العميل رائحة مختلفة لكل واحدة.'
                                    : 'Admin sets products + quantities. For each unit (slot), the customer picks a variant/scent. Example: 3 shampoos — customer chooses a different scent for each one.',
                                color: 'violet'
                            },
                            {
                                value: 'mix_and_match',
                                icon: <Shuffle size={22} />,
                                title: i18n.language === 'ar' ? 'اختر وركّب' : 'Mix & Match',
                                short: i18n.language === 'ar' ? 'العميل يختار X منتجات من قائمة' : 'Customer picks X products from a list',
                                desc: i18n.language === 'ar'
                                    ? 'تضع الإدارة مجموعة منتجات، والعميل يختار عدداً محدداً منها. مثال: اختر 3 منتجات من أصل 10. الحد الأدنى للاختيار يُحدَّد في قواعد الباقة.'
                                    : 'Admin adds a pool of products. Customer picks a set number from them. Example: pick any 3 out of 10. Minimum count is set in bundle rules.',
                                color: 'amber'
                            }
                        ] as const).map((typeOption) => {
                            const isSelected = bundleType === typeOption.value;
                            const colorMap: Record<string, string> = {
                                blue: isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300/30' : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/30',
                                violet: isSelected ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-300/30' : 'border-gray-200 hover:border-violet-200 hover:bg-violet-50/30',
                                amber: isSelected ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300/30' : 'border-gray-200 hover:border-amber-200 hover:bg-amber-50/30',
                            };
                            const iconColorMap: Record<string, string> = {
                                blue: isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-500',
                                violet: isSelected ? 'bg-violet-600 text-white' : 'bg-violet-100 text-violet-500',
                                amber: isSelected ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-500',
                            };
                            return (
                                <label
                                    key={typeOption.value}
                                    className={`relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 select-none ${colorMap[typeOption.color]}`}
                                >
                                    <input
                                        type="radio"
                                        value={typeOption.value}
                                        className="hidden"
                                        {...register("bundle_type")}
                                    />
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                                            <Check size={11} className="text-white" />
                                        </div>
                                    )}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${iconColorMap[typeOption.color]}`}>
                                        {typeOption.icon}
                                    </div>
                                    <span className="font-bold text-sm text-gray-900 mb-0.5">{typeOption.title}</span>
                                    <span className="text-[11px] font-semibold text-primary-600 mb-2">{typeOption.short}</span>
                                    <span className="text-[11px] text-gray-500 leading-relaxed">{typeOption.desc}</span>
                                </label>
                            );
                        })}
                    </div>

                    {/* Dynamic contextual config based on selected type */}
                    <AnimatePresence mode="wait">
                        {bundleType === 'fixed' && (
                            <motion.div
                                key="fixed-info"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                                className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3"
                            >
                                <Lock size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-blue-800 mb-1">
                                        {i18n.language === 'ar' ? 'باقة ثابتة — لا تحتاج قواعد إضافية' : 'Fixed Bundle — No extra rules needed'}
                                    </p>
                                    <p className="text-xs text-blue-600 leading-relaxed">
                                        {i18n.language === 'ar'
                                            ? 'أضف المنتجات والكميات في القسم التالي. سيراها العميل كما حددتها بالضبط ولا يمكنه تغيير أي شيء.'
                                            : 'Add products and quantities in the next section. The customer will see them exactly as you set them and cannot change anything.'}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {bundleType === 'build_your_own' && (
                            <motion.div
                                key="byo-config"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                                className="bg-violet-50 border border-violet-200 rounded-xl p-5 space-y-4"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles size={16} className="text-violet-600" />
                                    <span className="text-sm font-bold text-violet-800">
                                        {i18n.language === 'ar' ? 'إعدادات نوع "اصنع باقتك"' : 'Build Your Own — Configuration'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            {i18n.language === 'ar' ? 'الحد الأقصى للـ variants لكل منتج' : 'Max Variants Per Product Slot'}
                                        </label>
                                        <input
                                            type="number" min={1}
                                            className="w-full p-2.5 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-400 focus:outline-none bg-white text-sm"
                                            {...register("rules.max_variants_per_product")}
                                        />
                                        <p className="text-[10px] text-violet-600 mt-1">
                                            {i18n.language === 'ar'
                                                ? 'عدد الخيارات المختلفة التي يمكن للعميل اختيارها من نفس المنتج (عادةً 1)'
                                                : 'How many different variant slots can be chosen from the same product (usually 1)'}
                                        </p>
                                    </div>
                                    <div className="space-y-3 pt-1">
                                        <Controller
                                            name="rules.allow_duplicate_variants"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-start gap-3 cursor-pointer select-none" onClick={() => field.onChange(!field.value)}>
                                                    <ToggleSwitch checked={!!field.value} onChange={field.onChange} color="violet" />
                                                    <div>
                                                        <span className="block text-xs font-semibold text-gray-700">
                                                            {i18n.language === 'ar' ? 'السماح بتكرار نفس النوع/الرائحة' : 'Allow duplicate variants'}
                                                        </span>
                                                        <span className="block text-[10px] text-gray-400">
                                                            {i18n.language === 'ar' ? 'مثال: يختار نفس الرائحة أكثر من مرة' : 'e.g. pick the same scent more than once'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {bundleType === 'mix_and_match' && (
                            <motion.div
                                key="mix-config"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                                className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Shuffle size={16} className="text-amber-600" />
                                    <span className="text-sm font-bold text-amber-800">
                                        {i18n.language === 'ar' ? 'إعدادات نوع "اختر وركّب"' : 'Mix & Match — Configuration'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            {i18n.language === 'ar' ? 'عدد المنتجات المطلوب اختيارها *' : 'Required Products to Pick *'}
                                        </label>
                                        <input
                                            type="number" min={1}
                                            className="w-full p-2.5 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none bg-white text-sm"
                                            {...register("rules.min_quantity")}
                                        />
                                        <p className="text-[10px] text-amber-700 mt-1 font-semibold">
                                            {i18n.language === 'ar' ? '⚡ هذا الرقم يظهر كهدف للعميل' : '⚡ This number shows as the customer target'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            {i18n.language === 'ar' ? 'الحد الأقصى للاختيار' : 'Max Selection Limit'}
                                        </label>
                                        <input
                                            type="number" min={1}
                                            className="w-full p-2.5 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none bg-white text-sm"
                                            {...register("rules.max_quantity")}
                                        />
                                    </div>
                                    <div className="space-y-3 pt-1">
                                        <Controller
                                            name="rules.allow_duplicate_products"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-start gap-3 cursor-pointer select-none" onClick={() => field.onChange(!field.value)}>
                                                    <ToggleSwitch checked={!!field.value} onChange={field.onChange} color="amber" />
                                                    <div>
                                                        <span className="block text-xs font-semibold text-gray-700">
                                                            {i18n.language === 'ar' ? 'السماح بتكرار نفس المنتج' : 'Allow duplicate products'}
                                                        </span>
                                                        <span className="block text-[10px] text-gray-400">
                                                            {i18n.language === 'ar' ? 'يختار العميل نفس المنتج أكثر من مرة' : 'Customer can pick same product multiple times'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </CollapsibleSection>

            {/* Section 4 — Product Selection & Variant Selection */}
            <CollapsibleSection
                step={4}
                title={i18n.language === 'ar' ? 'اختيار المنتجات والخيارات الفرعية' : 'Product & Variant Selection'}
                subtitle={i18n.language === 'ar' ? 'حدد المنتجات المتضمنة في الباقة وروائحها المتاحة' : 'Choose products included in this bundle'}
            >
                <div className="space-y-5">
                    {/* Local Products Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={i18n.language === 'ar' ? 'البحث عن منتج بالاسم...' : 'Search products by name...'}
                            className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                        />
                    </div>

                    {loadingProducts ? (
                        <div className="text-center py-8 text-xs text-gray-400 font-semibold">{i18n.language === 'ar' ? 'جاري تحميل قائمة المنتجات...' : 'Loading products...'}</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-8 text-xs text-gray-400 font-semibold">{i18n.language === 'ar' ? 'لا توجد منتجات مطابقة في هذا القسم.' : 'No products found matching criteria.'}</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                            {filteredProducts.map((p) => {
                                const isSelected = isProductSelected(p.id);
                                const variants = productVariantsMap[p.id] || [];
                                const hasVariants = variants.length > 0;
                                const isLoadingVariants = loadingVariantsMap[p.id];
                                
                                return (
                                    <div 
                                        key={p.id} 
                                        className={`border-2 rounded-2xl p-4 transition-all duration-200 ${
                                            isSelected 
                                                ? 'border-primary-500 bg-primary-50/40 shadow-2xs' 
                                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-11 h-11 bg-gray-100 border border-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center shadow-2xs">
                                                    {p.image_url ? (
                                                        <Image src={p.image_url} alt="" fill className="object-cover" />
                                                    ) : (
                                                        <Box className="w-5 h-5 text-gray-300 stroke-1" />
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
                                                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                                    isSelected 
                                                        ? 'bg-primary-900 text-white shadow-xs' 
                                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                }`}
                                            >
                                                {isSelected ? (i18n.language === 'ar' ? 'محدد ✓' : 'Selected') : (i18n.language === 'ar' ? '+ تحديد' : '+ Select')}
                                            </button>
                                        </div>

                                        {/* Sub-Variants List */}
                                        {isSelected && (
                                            <div className="mt-3 pt-3 border-t border-gray-100/80 space-y-2">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    {i18n.language === 'ar' ? 'الخيارات والأنواع المتاحة:' : 'Scents / Variants Available:'}
                                                </div>
                                                {isLoadingVariants ? (
                                                    <div className="text-[10px] text-gray-400 animate-pulse">{i18n.language === 'ar' ? 'جاري التحميل...' : 'Loading variants...'}</div>
                                                ) : !hasVariants ? (
                                                    <div className="text-[10px] text-gray-400 italic">{i18n.language === 'ar' ? 'لا يوجد أنواع فرعية لهذا المنتج.' : 'No variants available.'}</div>
                                                ) : (
                                                    <div className="space-y-1.5">
                                                        {variants.map((v) => {
                                                            const isVarSelected = watchedItems.some(item => item.product_id === p.id && item.variant_id === v.id);
                                                            return (
                                                                <label key={v.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-100 cursor-pointer text-xs select-none transition-all">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isVarSelected}
                                                                            onChange={() => handleVariantToggle(p, v)}
                                                                            className="rounded text-primary-700 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                                                                        />
                                                                        <span className="font-semibold text-gray-800">
                                                                            {i18n.language === 'ar' ? v.name_ar : v.name_en}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-[10px] text-gray-400 font-mono font-semibold">{(v.price || p.price).toFixed(2)} EGP</span>
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

                    {/* Selected Items — Grouped by product */}
                    {watchedItems.length > 0 && (() => {
                        const groups = new Map<number, number[]>();
                        itemFields.forEach((_, index) => {
                            const item = watchedItems[index] || {} as any;
                            const pid = item.product_id as number;
                            if (pid == null) return;
                            if (!groups.has(pid)) groups.set(pid, []);
                            groups.get(pid)!.push(index);
                        });

                        return (
                            <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
                                <div className="text-xs font-bold text-gray-800 flex items-center justify-between">
                                    <span>{i18n.language === 'ar' ? 'المنتجات والكميات المختارة حالياً:' : 'Configured Bundle Items:'}</span>
                                    <span className="text-[10px] font-extrabold text-primary-800 bg-primary-50 px-2.5 py-0.5 rounded-full font-mono">
                                        {groups.size} {i18n.language === 'ar' ? 'منتجات' : 'Products'}
                                    </span>
                                </div>
                                <div className="space-y-2.5">
                                    {Array.from(groups.entries()).map(([pid, indices]) => {
                                        const firstIdx = indices[0];
                                        const firstItem = watchedItems[firstIdx] || {} as any;
                                        const currentQty = watchedItems[firstIdx]?.quantity || 1;
                                        const variantIndices = indices.filter(i => watchedItems[i]?.variant_id);
                                        const hasVariants = variantIndices.length > 0;
                                        const productName = i18n.language === 'ar' ? firstItem.product_name_ar : firstItem.product_name_en;

                                        return (
                                            <div key={pid} className="bg-gray-50/80 border border-gray-200/70 rounded-2xl p-3.5 flex flex-col md:flex-row md:items-center gap-3 text-xs shadow-2xs">
                                                {/* Product info + variant chips */}
                                                <div className="flex-grow min-w-0">
                                                    <div className="font-bold text-gray-900">{productName}</div>
                                                    {hasVariants && (
                                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                            {variantIndices.map(idx => {
                                                                const vItem = watchedItems[idx] || {} as any;
                                                                const vName = i18n.language === 'ar'
                                                                    ? (vItem.variant_name_ar || vItem.variant_name_en || '')
                                                                    : (vItem.variant_name_en || vItem.variant_name_ar || '');
                                                                return (
                                                                    <span key={idx} className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-900 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-2xs">
                                                                        {vName}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeItem(idx)}
                                                                            className="hover:text-red-600 leading-none font-extrabold cursor-pointer"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Qty + Remove */}
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-500 text-[11px] font-bold">{i18n.language === 'ar' ? 'الكمية:' : 'Qty:'}</span>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={currentQty}
                                                            className="w-16 p-1.5 border border-gray-200 rounded-xl text-center font-bold bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
                                                            onChange={(e) => {
                                                                const newQty = Math.max(1, Number(e.target.value) || 1);
                                                                indices.forEach(i => {
                                                                    setValue(`items.${i}.quantity`, newQty, { shouldValidate: false });
                                                                });
                                                            }}
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            [...indices].sort((a, b) => b - a).forEach(i => removeItem(i));
                                                        }}
                                                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </CollapsibleSection>

            {/* Section 5 — Bundle Pricing */}
            <CollapsibleSection
                step={5}
                title={i18n.language === 'ar' ? 'تسعير الباقة' : 'Bundle Pricing'}
                subtitle={i18n.language === 'ar' ? 'طريقة تحديد خصم الباقة والسعر النهائي' : 'Pricing logic and final price breakdown'}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">{i18n.language === 'ar' ? 'طريقة التسعير' : 'Pricing Type'}</label>
                            <div className="space-y-2.5">
                                {[
                                    { value: 'fixed_price', label: i18n.language === 'ar' ? 'سعر باقة ثابت ومحدد' : 'Fixed Price Override' },
                                    { value: 'percentage_discount', label: i18n.language === 'ar' ? 'خصم مئوي من إجمالي المنتجات' : 'Percentage Discount' },
                                    { value: 'fixed_amount_discount', label: i18n.language === 'ar' ? 'خصم مبلغ ثابت من الإجمالي' : 'Fixed Amount Discount' }
                                ].map((opt) => (
                                    <label key={opt.value} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer text-xs font-bold transition-all select-none ${
                                        pricingType === opt.value
                                            ? 'border-primary-500 bg-primary-50/50 text-primary-900'
                                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                    }`}>
                                        <input
                                            type="radio"
                                            value={opt.value}
                                            className="text-primary-700 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                                            {...register("pricing_type")}
                                        />
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {pricingType === 'fixed_price' ? (
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">{i18n.language === 'ar' ? 'سعر الباقة النهائي *' : 'Final Bundle Price *'}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl pr-14 font-bold text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all font-mono"
                                        placeholder="0.00"
                                        {...register("fixed_price")}
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 font-mono">EGP</span>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    {pricingType === 'percentage_discount' 
                                        ? (i18n.language === 'ar' ? 'نسبة الخصم المئوية *' : 'Discount Percentage *') 
                                        : (i18n.language === 'ar' ? 'قيمة الخصم المالي *' : 'Discount Amount *')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={0}
                                        step={pricingType === 'percentage_discount' ? 1 : 0.01}
                                        className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl pr-14 font-bold text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all font-mono"
                                        placeholder="0"
                                        {...register("discount_value")}
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 font-mono">
                                        {pricingType === 'percentage_discount' ? '%' : 'EGP'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Live Financial Analytics Card */}
                    <div className="flex flex-col gap-3">
                        {/* Header Badge */}
                        <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 text-white rounded-3xl p-5 relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

                            <div className="relative z-10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold tracking-widest uppercase bg-white/10 px-3 py-1 rounded-full text-primary-200">
                                        {i18n.language === 'ar' ? '📊 تحليل مالي مباشر' : '📊 Live Financial Analysis'}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        pricingStats.discount_percent > 0 ? 'bg-emerald-400/20 text-emerald-300' : 'bg-white/10 text-gray-400'
                                    }`}>
                                        {i18n.language === 'ar' ? `خصم ${pricingStats.discount_percent.toFixed(1)}%` : `${pricingStats.discount_percent.toFixed(1)}% OFF`}
                                    </span>
                                </div>

                                {/* Original Total */}
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400">{i18n.language === 'ar' ? 'إجمالي المنتجات:' : 'Products Total:'}</span>
                                    <span className="font-bold text-gray-400 line-through font-mono">{pricingStats.original_total.toFixed(2)} EGP</span>
                                </div>

                                {/* Discount */}
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400">{i18n.language === 'ar' ? 'خصم الباقة:' : 'Bundle Discount:'}</span>
                                    <span className="font-bold text-rose-400 font-mono">-{pricingStats.discount.toFixed(2)} EGP</span>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-white/10" />

                                {/* Final Price */}
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-300">{i18n.language === 'ar' ? 'سعر الباقة النهائي' : 'Final Bundle Price'}</span>
                                    <span className="text-2xl font-extrabold font-mono text-emerald-300">{pricingStats.final_price.toFixed(2)} EGP</span>
                                </div>
                            </div>
                        </div>

                        {/* Financial Metrics Grid */}
                        <div className="grid grid-cols-2 gap-2.5">
                            {/* Gross Margin % */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <span className="text-base">📈</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        {i18n.language === 'ar' ? 'هامش إجمالي الربح' : 'Gross Margin'}
                                    </span>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className="text-xl font-extrabold font-mono text-primary-700">
                                        {pricingStats.gross_margin_percent.toFixed(1)}
                                    </span>
                                    <span className="text-xs font-bold text-primary-400 mb-0.5">%</span>
                                </div>
                                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, pricingStats.gross_margin_percent)}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 block">
                                    {i18n.language === 'ar' ? 'نسبة السعر المحتفظ به' : 'Price retention ratio'}
                                </span>
                            </div>

                            {/* Discount % */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <span className="text-base">🏷️</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        {i18n.language === 'ar' ? 'نسبة الخصم للعميل' : 'Customer Discount'}
                                    </span>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className="text-xl font-extrabold font-mono text-rose-500">
                                        {pricingStats.discount_percent.toFixed(1)}
                                    </span>
                                    <span className="text-xs font-bold text-rose-400 mb-0.5">%</span>
                                </div>
                                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-rose-400 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, pricingStats.discount_percent)}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 block">
                                    {i18n.language === 'ar' ? `وفر ${pricingStats.discount.toFixed(2)} ج.م للعميل` : `Saves ${pricingStats.discount.toFixed(2)} EGP`}
                                </span>
                            </div>

                            {/* Net Profit Estimate */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <span className="text-base">💰</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        {i18n.language === 'ar' ? 'صافي الربح التقديري' : 'Est. Net Profit'}
                                    </span>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className={`text-xl font-extrabold font-mono ${pricingStats.net_profit > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {pricingStats.net_profit.toFixed(2)}
                                    </span>
                                    <span className="text-xs font-bold text-gray-400 mb-0.5">EGP</span>
                                </div>
                                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${pricingStats.net_profit > 0 ? 'bg-emerald-400' : 'bg-red-400'}`}
                                        style={{ width: `${Math.min(100, Math.max(0, pricingStats.net_margin_percent))}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 block">
                                    {i18n.language === 'ar' ? 'بعد خصم التكلفة التقديرية (40%)' : 'After est. COGS (40%)'}
                                </span>
                            </div>

                            {/* Net Margin % */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <span className="text-base">🎯</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        {i18n.language === 'ar' ? 'هامش صافي الربح' : 'Net Profit Margin'}
                                    </span>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className={`text-xl font-extrabold font-mono ${pricingStats.net_margin_percent >= 30 ? 'text-emerald-600' : pricingStats.net_margin_percent >= 10 ? 'text-amber-500' : 'text-red-500'}`}>
                                        {pricingStats.net_margin_percent.toFixed(1)}
                                    </span>
                                    <span className="text-xs font-bold text-gray-400 mb-0.5">%</span>
                                </div>
                                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            pricingStats.net_margin_percent >= 30 ? 'bg-emerald-400'
                                            : pricingStats.net_margin_percent >= 10 ? 'bg-amber-400'
                                            : 'bg-red-400'
                                        }`}
                                        style={{ width: `${Math.min(100, Math.max(0, pricingStats.net_margin_percent))}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 block">
                                    {pricingStats.net_margin_percent >= 30
                                        ? (i18n.language === 'ar' ? '✅ هامش ممتاز' : '✅ Excellent margin')
                                        : pricingStats.net_margin_percent >= 10
                                            ? (i18n.language === 'ar' ? '⚠️ هامش مقبول' : '⚠️ Acceptable margin')
                                            : (i18n.language === 'ar' ? '❌ هامش منخفض' : '❌ Low margin')
                                    }
                                </span>
                            </div>
                        </div>

                        {/* COGS Info Note */}
                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                            <span className="text-amber-500 text-sm mt-0.5 flex-shrink-0">ℹ️</span>
                            <p className="text-[10px] text-amber-700 leading-relaxed">
                                {i18n.language === 'ar'
                                    ? 'صافي الربح تقديري مبني على افتراض تكلفة البضاعة (COGS) ≈ 40% من إجمالي المنتجات. عدّل هذه النسبة وفقاً لتكاليفك الفعلية.'
                                    : 'Net profit is estimated based on an assumed COGS of ~40% of original product total. Adjust based on your actual cost structure.'}
                            </p>
                        </div>
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
