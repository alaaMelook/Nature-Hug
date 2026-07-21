"use client";

import React, { useState, useEffect, useMemo } from "react";
import { BundleDetailView } from "@/domain/entities/views/shop/bundleDetailView";
import { useCart } from "@/ui/providers/CartProvider";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Check, ShoppingCart, X, ChevronLeft, Sparkles, Lock, Shuffle, Tag } from "lucide-react";
import { toast } from "sonner";

type SelectionDetail = {
    id: number;
    name: string;
    price: number;
    image?: string | null;
};

function BundleTypeBadge({ type, isAr }: { type: string; isAr: boolean }) {
    if (type === "fixed") return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
            <Lock size={11} />
            {isAr ? "باقة ثابتة" : "Fixed Bundle"}
        </span>
    );
    if (type === "build_your_own") return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
            <Sparkles size={11} />
            {isAr ? "اصنع باقتك" : "Build Your Own"}
        </span>
    );
    if (type === "mix_and_match") return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            <Shuffle size={11} />
            {isAr ? "اختر وركّب" : "Mix & Match"}
        </span>
    );
    return null;
}

export function BundleCustomizerScreen({ bundle, lang }: { bundle: BundleDetailView; lang: string }) {
    const { addToCart } = useCart();
    const { t } = useTranslation();
    const router = useRouter();
    const isAr = lang === "ar";

    const isMixAndMatch = bundle.bundle_type === "mix_and_match";
    const isBuildYourOwn = bundle.bundle_type === "build_your_own";
    const isFixed = bundle.bundle_type === "fixed";
    const requiredCount = bundle.rules?.min_quantity ?? bundle.items.length;

    const [selections, setSelections] = useState<Record<string, number>>({});
    const [selectionDetails, setSelectionDetails] = useState<Record<string, SelectionDetail>>({});
    const [mixSelected, setMixSelected] = useState<Set<number>>(new Set());
    const [showSummary, setShowSummary] = useState(false);

    useEffect(() => {
        if (isMixAndMatch) return;
        const initialSelections: Record<string, number> = {};
        const initialDetails: Record<string, SelectionDetail> = {};
        for (const item of bundle.items) {
            if (item.has_variants && item.variants.length > 0) {
                const firstVar = item.variants[0];
                for (let s = 0; s < item.quantity; s++) {
                    const key = `${item.product_id}-${s}`;
                    initialSelections[key] = firstVar.id;
                    initialDetails[key] = {
                        id: firstVar.id,
                        name: isAr ? firstVar.name_ar : firstVar.name_en,
                        price: firstVar.price,
                        image: firstVar.image ?? null,
                    };
                }
            }
        }
        setSelections(initialSelections);
        setSelectionDetails(initialDetails);
    }, [bundle, isAr, isMixAndMatch]);

    const liveOriginalTotal = useMemo(() => {
        let total = 0;
        for (const item of bundle.items) {
            if (isMixAndMatch && !mixSelected.has(item.product_id)) continue;
            for (let s = 0; s < item.quantity; s++) {
                const key = `${item.product_id}-${s}`;
                const sel = selectionDetails[key];
                total += sel ? sel.price : item.product.price || 0;
            }
        }
        return total;
    }, [bundle.items, selectionDetails, isMixAndMatch, mixSelected]);

    const { liveFinalPrice, liveDiscount } = useMemo(() => {
        let finalP = liveOriginalTotal;
        let disc = 0;
        if (bundle.pricing_type === "percentage_discount") {
            disc = liveOriginalTotal * ((bundle.discount_value || 0) / 100);
            finalP = liveOriginalTotal - disc;
        } else if (bundle.pricing_type === "fixed_amount_discount") {
            disc = Math.min(bundle.discount_value || 0, liveOriginalTotal);
            finalP = Math.max(0, liveOriginalTotal - disc);
        } else if (bundle.pricing_type === "fixed_price") {
            finalP = bundle.fixed_price || 0;
            disc = Math.max(0, liveOriginalTotal - finalP);
        }
        return { liveFinalPrice: finalP, liveDiscount: disc };
    }, [liveOriginalTotal, bundle.pricing_type, bundle.discount_value, bundle.fixed_price]);

    const discountPercent = liveOriginalTotal > 0 ? Math.round((liveDiscount / liveOriginalTotal) * 100) : 0;

    const handleSelectVariant = (productId: number, slotIndex: number, variant: any) => {
        const key = `${productId}-${slotIndex}`;
        setSelections((prev) => ({ ...prev, [key]: variant.id }));
        setSelectionDetails((prev) => ({
            ...prev,
            [key]: {
                id: variant.id,
                name: isAr ? variant.name_ar : variant.name_en,
                price: variant.price,
                image: variant.image ?? null,
            },
        }));
    };

    const handleMixToggle = (item: (typeof bundle.items)[0]) => {
        const pid = item.product_id;
        if (mixSelected.has(pid)) {
            setMixSelected((prev) => { const s = new Set(prev); s.delete(pid); return s; });
            setSelections((prev) => { const n = { ...prev }; for (let s = 0; s < item.quantity; s++) delete n[`${pid}-${s}`]; return n; });
            setSelectionDetails((prev) => { const n = { ...prev }; for (let s = 0; s < item.quantity; s++) delete n[`${pid}-${s}`]; return n; });
        } else {
            if (mixSelected.size >= requiredCount && !bundle.rules?.allow_duplicate_products) {
                toast.error(isAr ? `يمكنك اختيار ${requiredCount} منتجات فقط` : `You can only select ${requiredCount} products`);
                return;
            }
            const newSet = new Set(mixSelected);
            newSet.add(pid);
            setMixSelected(newSet);
            if (item.has_variants && item.variants.length > 0) {
                const firstVar = item.variants[0];
                setSelections((prev) => { const n = { ...prev }; for (let s = 0; s < item.quantity; s++) n[`${pid}-${s}`] = firstVar.id; return n; });
                setSelectionDetails((prev) => {
                    const n = { ...prev };
                    for (let s = 0; s < item.quantity; s++) {
                        n[`${pid}-${s}`] = { id: firstVar.id, name: isAr ? firstVar.name_ar : firstVar.name_en, price: firstVar.price, image: firstVar.image ?? null };
                    }
                    return n;
                });
            }
        }
    };

    const handleAddToCart = async () => {
        if (isMixAndMatch) {
            if (mixSelected.size < requiredCount) {
                toast.error(isAr ? `يرجى اختيار ${requiredCount} منتجات` : `Please select ${requiredCount} products`);
                return;
            }
        } else {
            for (const item of bundle.items) {
                if (item.has_variants) {
                    for (let s = 0; s < item.quantity; s++) {
                        if (!selections[`${item.product_id}-${s}`]) {
                            toast.error(isAr ? "يرجى اختيار المكونات لجميع المنتجات" : "Please select options for all products");
                            return;
                        }
                    }
                }
            }
        }
        const detailsList = Object.values(selectionDetails).map((d) => d.name).join(" + ");
        const configuredBundle: any = {
            id: bundle.id,
            variant_id: 0,
            name: `${bundle.name}${detailsList ? ` (${detailsList})` : ""}`,
            description: bundle.description,
            price: liveFinalPrice,
            original_price: liveOriginalTotal > liveFinalPrice ? liveOriginalTotal : null,
            stock: bundle.stock,
            discount: null,
            image: bundle.image || (bundle.items[0]?.product?.image ?? null),
            category_name: bundle.category_name,
            slug: `bundle-${bundle.slug}`,
            product_type: "bundle",
            selected_variants: selectionDetails,
        };
        try {
            await addToCart(configuredBundle, 1);
            router.push("/cart");
        } catch (err: any) {
            toast.error(t("failedToAdd"));
        }
    };

    const resolveImage = (item: (typeof bundle.items)[0]) => {
        const sel = selectionDetails[`${item.product_id}-0`] || selectionDetails[`${item.product_id}-1`] || selectionDetails[`${item.product_id}-2`];
        return sel?.image || item.product.image || null;
    };

    const mixProgress = isMixAndMatch ? Math.min((mixSelected.size / requiredCount) * 100, 100) : 100;
    const isReadyToAdd = isMixAndMatch ? mixSelected.size >= requiredCount : true;

    return (
        <div className="bg-[#f8f7f5] min-h-screen font-cairo" dir={isAr ? "rtl" : "ltr"}>

            {/* === Hero Header === */}
            <div className="relative bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 overflow-hidden">
                {bundle.image && (
                    <div className="absolute inset-0 opacity-15">
                        <Image src={bundle.image} alt="" fill className="object-cover scale-110 blur-2xl" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 to-transparent" />
                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-8">
                    <button onClick={() => router.back()} className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-semibold mb-5 transition-colors cursor-pointer">
                        <ChevronLeft size={15} className={isAr ? "rotate-180" : ""} />
                        {isAr ? "العودة للتسوق" : "Back"}
                    </button>
                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl flex-shrink-0">
                            <Image src={bundle.image || "https://placehold.co/200x200/1a1a2e/ffffff?text=Bundle"} alt={bundle.name} fill className="object-cover" />
                        </div>
                        <div className="flex-grow">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {bundle.category_name && (
                                    <span className="text-[11px] font-bold text-primary-200 bg-white/10 px-2.5 py-0.5 rounded-full">{bundle.category_name}</span>
                                )}
                                <BundleTypeBadge type={bundle.bundle_type} isAr={isAr} />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">{bundle.name}</h1>
                            {bundle.description && (
                                <p className="text-sm text-white/60 mt-1 line-clamp-2 leading-relaxed">{bundle.description}</p>
                            )}
                        </div>
                        <div className="hidden sm:flex flex-col items-end flex-shrink-0">
                            {liveDiscount > 0 && (
                                <span className="text-white/50 line-through text-sm font-mono mb-0.5">
                                    {t("{{price, currency}}", { price: liveOriginalTotal })}
                                </span>
                            )}
                            <span className="text-3xl font-extrabold text-emerald-300 font-mono">
                                {t("{{price, currency}}", { price: liveFinalPrice })}
                            </span>
                            {discountPercent > 0 && (
                                <span className="mt-1 text-[11px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                                    {isAr ? `وفّر ${discountPercent}%` : `Save ${discountPercent}%`}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* === Mix & Match sticky progress bar === */}
            {isMixAndMatch && (
                <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
                        <div className="flex items-center justify-between mb-1.5 gap-3">
                            <span className="text-xs font-bold text-gray-700">
                                {isAr ? `اختر ${requiredCount} منتجات من القائمة` : `Pick ${requiredCount} products from the list`}
                            </span>
                            <span className={`text-xs font-extrabold tabular-nums ${mixSelected.size >= requiredCount ? "text-emerald-600" : "text-amber-600"}`}>
                                {mixSelected.size} / {requiredCount}
                            </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${mixProgress >= 100 ? "bg-emerald-500" : "bg-amber-400"}`}
                                animate={{ width: `${mixProgress}%` }}
                                transition={{ duration: 0.4 }}
                            />
                        </div>
                        {mixSelected.size >= requiredCount && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                                <Check size={11} />
                                {isAr ? "ممتاز! اختياراتك مكتملة. يمكنك إضافة الباقة للسلة." : "Great! Selections complete. You can add to cart."}
                            </motion.p>
                        )}
                    </div>
                </div>
            )}

            {/* === Main content === */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-36 space-y-4">

                {/* Instruction banners */}
                {isBuildYourOwn && (
                    <div className="flex items-start gap-3 bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3">
                        <Sparkles size={16} className="text-violet-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold text-violet-700 leading-relaxed">
                            {isAr
                                ? "اصنع باقتك المثالية! لكل منتج في الباقة، اختر النوع أو الرائحة التي تفضلها."
                                : "Build your perfect bundle! For each product, choose your preferred variant or scent."}
                        </p>
                    </div>
                )}
                {isFixed && (
                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
                        <Lock size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold text-blue-700 leading-relaxed">
                            {isAr
                                ? "هذه باقة جاهزة ومحددة المكونات. ستحصل على كل المنتجات المدرجة بالكميات المحددة."
                                : "This is a ready-made bundle. You will receive all listed products in the specified quantities."}
                        </p>
                    </div>
                )}

                <h2 className="text-sm font-extrabold text-gray-800 px-1">
                    {isMixAndMatch
                        ? (isAr ? "🛍️ المنتجات المتاحة للاختيار:" : "🛍️ Available Products:")
                        : (isAr ? "📦 مكونات الباقة:" : "📦 Bundle Contents:")}
                </h2>

                {/* Product cards */}
                {bundle.items.map((item, idx) => {
                    const prod = item.product;
                    const hasVariants = item.has_variants && item.variants.length > 0;
                    const isMixItemSelected = isMixAndMatch && mixSelected.has(item.product_id);
                    const displayImage = resolveImage(item);

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: idx * 0.06 }}
                        >
                            <div className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all duration-300 ${
                                isMixAndMatch
                                    ? isMixItemSelected ? "border-primary-500" : "border-gray-100 hover:border-gray-200"
                                    : "border-gray-100"
                            }`}>
                                {/* Card header */}
                                <div className="flex items-start gap-4 p-4">
                                    <div className="relative flex-shrink-0">
                                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm">
                                            <Image
                                                src={displayImage || "https://placehold.co/100x100/e5e7eb/9ca3af?text=Product"}
                                                alt={prod.name} fill className="object-cover transition-all duration-300"
                                            />
                                            {isMixItemSelected && (
                                                <div className="absolute inset-0 bg-primary-900/25 flex items-center justify-center">
                                                    <div className="bg-primary-600 rounded-full w-7 h-7 flex items-center justify-center shadow-md">
                                                        <Check size={14} className="text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {item.quantity > 1 && (
                                            <div className="absolute -top-1.5 -right-1.5 bg-primary-700 text-white text-[10px] font-extrabold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow">
                                                x{item.quantity}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-bold text-gray-900 truncate">{prod.name}</h3>
                                                {prod.description && (
                                                    <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">{prod.description}</p>
                                                )}
                                                {item.quantity > 1 && (
                                                    <span className="inline-block mt-1 text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                                                        {isAr ? `${item.quantity} قطع` : `Qty: ${item.quantity}`}
                                                    </span>
                                                )}
                                            </div>
                                            {isMixAndMatch && (
                                                <button
                                                    onClick={() => handleMixToggle(item)}
                                                    className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                                                        isMixItemSelected
                                                            ? "bg-primary-700 text-white border-primary-700 hover:bg-red-600 hover:border-red-600"
                                                            : "bg-white text-primary-700 border-primary-200 hover:bg-primary-50"
                                                    }`}
                                                >
                                                    {isMixItemSelected
                                                        ? <><X size={12} />{isAr ? "إلغاء" : "Remove"}</>
                                                        : <><Check size={12} />{isAr ? "اختيار" : "Select"}</>}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Variant selector */}
                                {hasVariants && (!isMixAndMatch || isMixItemSelected) && (
                                    <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-3 space-y-3">
                                        {Array.from({ length: item.quantity }).map((_, slotIdx) => {
                                            const key = `${item.product_id}-${slotIdx}`;
                                            const currentSelectionId = selections[key];
                                            const currentDetail = selectionDetails[key];
                                            return (
                                                <div key={slotIdx}>
                                                    <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                        <Sparkles size={10} className="text-violet-400" />
                                                        {item.quantity > 1
                                                            ? (isAr ? `القطعة ${slotIdx + 1}:` : `Item #${slotIdx + 1}:`)
                                                            : (isAr ? "اختر النوع / الرائحة:" : "Choose variant / scent:")}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.variants.map((v) => {
                                                            const isSelected = currentSelectionId === v.id;
                                                            const optionName = isAr ? v.name_ar : v.name_en;
                                                            const outOfStock = v.stock <= 0;
                                                            return (
                                                                <button
                                                                    key={v.id}
                                                                    onClick={() => !outOfStock && handleSelectVariant(item.product_id, slotIdx, v)}
                                                                    disabled={outOfStock}
                                                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition-all duration-200 min-h-[38px] cursor-pointer ${
                                                                        isSelected
                                                                            ? "bg-primary-800 border-primary-800 text-white shadow-md"
                                                                            : outOfStock
                                                                                ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed line-through"
                                                                                : "bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50"
                                                                    }`}
                                                                >
                                                                    {v.image && (
                                                                        <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                                                                            <Image src={v.image} alt={optionName} fill className="object-cover" />
                                                                        </div>
                                                                    )}
                                                                    {isSelected && !v.image && <Check size={11} />}
                                                                    <span>{optionName}</span>
                                                                    {outOfStock && <span className="text-[9px] text-red-400 font-normal">({isAr ? "نفد" : "Out"})</span>}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {currentDetail && (
                                                        <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-700 font-semibold">
                                                            <Check size={12} className="flex-shrink-0" />
                                                            <span>{isAr ? "اخترت:" : "Selected:"} <span className="font-bold">{currentDetail.name}</span></span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* No variants notice */}
                                {!hasVariants && !isMixAndMatch && (
                                    <div className="border-t border-gray-100 px-4 py-2.5 flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                            <Check size={11} className="text-emerald-600" />
                                        </div>
                                        <span className="text-[11px] text-gray-500 font-semibold">
                                            {isAr ? "منتج ثابت — مضاف تلقائياً" : "Fixed product — added automatically"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* === Sticky bottom bar === */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
                    <div className="flex items-center justify-between mb-3 gap-3">
                        <div>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                                {isAr ? "إجمالي الباقة" : "Bundle Total"}
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-extrabold text-primary-900 font-mono">
                                    {t("{{price, currency}}", { price: liveFinalPrice })}
                                </span>
                                {liveDiscount > 0 && (
                                    <span className="text-sm text-gray-400 line-through font-mono">
                                        {t("{{price, currency}}", { price: liveOriginalTotal })}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {liveDiscount > 0 && (
                                <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                                    <Tag size={12} />
                                    {isAr ? `وفّر ${t("{{price, currency}}", { price: liveDiscount })}` : `Save ${t("{{price, currency}}", { price: liveDiscount })}`}
                                </div>
                            )}
                            {Object.keys(selectionDetails).length > 0 && (
                                <button onClick={() => setShowSummary(!showSummary)} className="text-[11px] font-bold text-primary-700 underline underline-offset-2 cursor-pointer">
                                    {isAr ? "تفاصيل" : "Details"}
                                </button>
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {showSummary && Object.keys(selectionDetails).length > 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mb-3"
                            >
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-wrap gap-2">
                                    {Object.entries(selectionDetails).map(([key, detail]) => {
                                        const [pid] = key.split("-");
                                        const item = bundle.items.find((i) => i.product_id === Number(pid));
                                        return (
                                            <div key={key} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-700">
                                                {detail.image && (
                                                    <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                                                        <Image src={detail.image} alt={detail.name} fill className="object-cover" />
                                                    </div>
                                                )}
                                                <span className="text-gray-400">{item?.product?.name}:</span>
                                                <span className="text-primary-800">{detail.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={handleAddToCart}
                        disabled={bundle.stock <= 0 || !isReadyToAdd}
                        className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                            bundle.stock <= 0
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : isReadyToAdd
                                    ? "bg-primary-800 hover:bg-primary-900 active:scale-[0.99] text-white shadow-md"
                                    : "bg-amber-100 text-amber-700 border-2 border-amber-300"
                        }`}
                    >
                        {bundle.stock <= 0 ? (
                            <>{isAr ? "❌ المنتج غير متوفر" : "❌ Out of Stock"}</>
                        ) : isMixAndMatch && !isReadyToAdd ? (
                            <>{isAr ? `🛒 اختر ${requiredCount - mixSelected.size} منتجات أخرى` : `🛒 Pick ${requiredCount - mixSelected.size} more`}</>
                        ) : (
                            <><ShoppingCart size={18} />{isAr ? "إضافة الباقة إلى السلة" : "Add Bundle to Cart"}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
