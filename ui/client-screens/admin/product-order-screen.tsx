'use client';

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
    GripVertical,
    Save,
    ArrowLeft,
    Package,
    EyeOff,
    Layers,
    RotateCcw,
    CheckCircle2,
    Loader2,
    ArrowUp,
    ArrowDown,
    MoveVertical,
} from "lucide-react";

// A flat display item = either a standalone product or a single variant
interface DisplayItem {
    uid: string; // unique key: "p-{id}" or "v-{id}"
    type: 'product' | 'variant';
    product_id: number;
    variant_id: number | null;
    name: string;
    name_ar: string;
    slug: string;
    image: string | null;
    price: number;
    stock: number;
    is_visible: boolean;
    parent_name?: string; // for variants: name of parent product
}

interface ApiProduct {
    id: number;
    name: string;
    name_ar: string;
    slug: string;
    image_url: string | null;
    price: number;
    stock: number;
    is_visible: boolean;
    sort_order: number;
    variant_count: number;
    variants: {
        id: number;
        product_id: number;
        name_en: string;
        name_ar: string;
        slug: string;
        image: string | null;
        price: number;
        stock: number;
        is_visible: boolean;
        sort_order: number;
    }[];
}

// Convert API data to flat display list
function buildFlatList(apiProducts: ApiProduct[]): DisplayItem[] {
    const items: DisplayItem[] = [];
    for (const p of apiProducts) {
        if (p.variants.length === 0) {
            // Standalone product
            items.push({
                uid: `p-${p.id}`,
                type: 'product',
                product_id: p.id,
                variant_id: null,
                name: p.name,
                name_ar: p.name_ar,
                slug: p.slug,
                image: p.image_url,
                price: p.price,
                stock: p.stock,
                is_visible: p.is_visible,
            });
        } else {
            // Product with variants: show each variant as a row
            for (const v of p.variants) {
                items.push({
                    uid: `v-${v.id}`,
                    type: 'variant',
                    product_id: p.id,
                    variant_id: v.id,
                    name: v.name_en,
                    name_ar: v.name_ar,
                    slug: v.slug,
                    image: v.image,
                    price: v.price,
                    stock: v.stock,
                    is_visible: v.is_visible,
                    parent_name: p.name,
                });
            }
        }
    }
    return items;
}

// Convert flat display list back to product/variant order for API save
function buildOrderPayload(items: DisplayItem[]) {
    // We now assign the absolute global position so everything orders correctly on the storefront
    const productOrders: Map<number, number> = new Map(); 
    const variantOrders: { id: number; sort_order: number }[] = [];

    items.forEach((item, globalIndex) => {
        const order = globalIndex + 1;
        if (item.type === 'product') {
            productOrders.set(item.product_id, order);
        } else {
            // For products with variants, the product itself might still need a sort_order
            // Keep the position of its first variant if we haven't seen it yet
            if (!productOrders.has(item.product_id)) {
                productOrders.set(item.product_id, order);
            }
            variantOrders.push({ id: item.variant_id!, sort_order: order });
        }
    });

    const productOrder = Array.from(productOrders.entries()).map(([id, sort_order]) => ({
        id,
        sort_order
    }));

    return { productOrder, variantOrder: variantOrders };
}

export function ProductOrderScreen() {
    const { i18n } = useTranslation();
    const router = useRouter();
    const [items, setItems] = useState<DisplayItem[]>([]);
    const [originalItems, setOriginalItems] = useState<DisplayItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/product-order');
            if (!res.ok) throw new Error('Failed to fetch');
            const data: ApiProduct[] = await res.json();
            const flat = buildFlatList(data);
            setItems(flat);
            setOriginalItems(JSON.parse(JSON.stringify(flat)));
            setHasChanges(false);
        } catch (error) {
            toast.error(i18n.language === 'ar' ? 'فشل تحميل المنتجات' : 'Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [i18n.language]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    // Check changes
    useEffect(() => {
        if (originalItems.length === 0) return;
        const changed = items.some((item, i) => item.uid !== originalItems[i]?.uid);
        setHasChanges(changed);
    }, [items, originalItems]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = buildOrderPayload(items);
            const res = await fetch('/api/admin/product-order', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to save');
            setOriginalItems(JSON.parse(JSON.stringify(items)));
            setHasChanges(false);
            toast.success(i18n.language === 'ar' ? 'تم حفظ الترتيب بنجاح' : 'Order saved successfully');
        } catch (error) {
            toast.error(i18n.language === 'ar' ? 'فشل حفظ الترتيب' : 'Failed to save order');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setItems(JSON.parse(JSON.stringify(originalItems)));
        setHasChanges(false);
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= items.length) return;
        const newItems = [...items];
        [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
        setItems(newItems);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                    <p className="text-sm text-gray-500">{i18n.language === 'ar' ? 'جاري تحميل المنتجات...' : 'Loading products...'}</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/admin/products')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {i18n.language === 'ar' ? 'ترتيب المنتجات' : 'Product Display Order'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {i18n.language === 'ar' ? 'رتبي المنتجات حسب الظهور على الموقع' : 'Arrange products for website display order'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {hasChanges && (
                        <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <RotateCcw className="w-4 h-4" />
                            {i18n.language === 'ar' ? 'إعادة تعيين' : 'Reset'}
                        </motion.button>
                    )}
                    <button onClick={handleSave} disabled={!hasChanges || saving}
                        className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all flex-1 sm:flex-none justify-center ${
                            hasChanges ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : hasChanges ? <Save className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        {saving ? (i18n.language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                            : hasChanges ? (i18n.language === 'ar' ? 'حفظ الترتيب' : 'Save Order')
                            : (i18n.language === 'ar' ? 'لا تغييرات' : 'No Changes')}
                    </button>
                </div>
            </div>

            {/* Unsaved banner */}
            <AnimatePresence>
                {hasChanges && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                        <p className="text-sm text-amber-700 font-medium">
                            {i18n.language === 'ar' ? 'لديك تغييرات غير محفوظة — اضغطي حفظ الترتيب' : 'You have unsaved changes — click Save Order to apply'}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instructions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <MoveVertical className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <p className="text-sm text-gray-700 font-medium">
                        {i18n.language === 'ar' ? 'كل عنصر يمثل منتج أو متغير كما يظهر على الموقع' : 'Each item represents a product or variant as shown on the website'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {i18n.language === 'ar' ? 'استخدمي الأسهم أو السحب لإعادة الترتيب' : 'Use arrows or drag & drop to reorder'}
                    </p>
                </div>
            </div>

            {/* Flat Items List */}
            <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
                {items.map((item, index) => {
                    const isVariant = item.type === 'variant';
                    const isChanged = originalItems[index]?.uid !== item.uid;

                    return (
                        <Reorder.Item key={item.uid} value={item} className="cursor-grab active:cursor-grabbing">
                            <motion.div
                                layout
                                className={`bg-white rounded-xl border shadow-sm flex items-center px-4 py-3 group transition-colors hover:border-primary-200 hover:shadow-md ${
                                    !item.is_visible ? 'opacity-60' : ''
                                } ${isChanged ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'}`}
                            >
                                {/* Drag */}
                                <div className="flex-shrink-0 p-1 text-gray-300 group-hover:text-gray-500 transition-colors mr-2">
                                    <GripVertical className="w-5 h-5" />
                                </div>

                                {/* Position */}
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 mr-3 ${
                                    index < 3 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {index + 1}
                                </div>

                                {/* Image */}
                                <div className="h-12 w-12 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200 mr-4">
                                    {item.image ? (
                                        <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full w-full text-gray-400">
                                            <Package className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 mr-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-900 truncate">
                                            {i18n.language === 'ar' ? item.name_ar : item.name}
                                        </span>
                                        {isVariant && (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-purple-100 text-purple-700 flex-shrink-0">
                                                <Layers className="w-3 h-3" />
                                                {i18n.language === 'ar' ? 'متغير' : 'Variant'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {isVariant && item.parent_name && (
                                            <>
                                                <span className="text-[10px] text-purple-500 font-medium">{item.parent_name}</span>
                                                <span className="text-xs text-gray-300">•</span>
                                            </>
                                        )}
                                        <span className="text-xs text-gray-500 font-mono truncate">{item.slug}</span>
                                        <span className="text-xs text-gray-300">•</span>
                                        <span className="text-xs font-medium text-gray-600">{item.price} EGP</span>
                                        {!item.is_visible && (
                                            <>
                                                <span className="text-xs text-gray-300">•</span>
                                                <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                                                    <EyeOff className="w-3 h-3" />
                                                    {i18n.language === 'ar' ? 'مخفي' : 'Hidden'}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Arrows */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveItem(index, 'up'); }}
                                        disabled={index === 0}
                                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveItem(index, 'down'); }}
                                        disabled={index === items.length - 1}
                                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        </Reorder.Item>
                    );
                })}
            </Reorder.Group>

            <div className="h-4"></div>
        </motion.div>
    );
}
