"use client";

import { useState, useMemo, useEffect, useRef, Fragment } from "react";
import { Search, Plus, Filter, Trash2, Tag, Copy, Pencil, Eye, ChevronDown, ChevronRight, Package, Box, Layers, Archive } from "lucide-react";
import { BundleAdminView } from "@/domain/entities/views/admin/bundleAdminView";
import { deleteBundleAction, duplicateBundleAction, updateBundleStatusAction } from "@/ui/hooks/admin/bundles";
import { toast } from "sonner";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function BundlesScreen({ bundles }: { bundles: BundleAdminView[] }) {
    const { t, i18n } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    // Filters
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'hidden'>('all');
    const [filterType, setFilterType] = useState<'all' | 'fixed' | 'build_your_own' | 'mix_and_match'>('all');
    const filterRef = useRef<HTMLDivElement>(null);

    // Expanded bundles (to view items inside)
    const [expandedBundles, setExpandedBundles] = useState<Set<number>>(new Set());

    const toggleExpand = (bundleId: number) => {
        setExpandedBundles(prev => {
            const next = new Set(prev);
            if (next.has(bundleId)) {
                next.delete(bundleId);
            } else {
                next.add(bundleId);
            }
            return next;
        });
    };

    // Quick status change handler
    const handleStatusChange = async (id: number, newStatus: 'active' | 'draft' | 'hidden') => {
        const result = await updateBundleStatusAction(id, newStatus);
        if (result.success) {
            toast.success(i18n.language === 'ar' ? "تم تحديث حالة الباقة بنجاح" : "Bundle status updated successfully");
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    // Close filters on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Unique categories for filtering
    const uniqueCategories = useMemo(() => {
        const cats = bundles
            .map(b => i18n.language === 'ar' ? (b.category_name_ar ?? b.category_name_en) : b.category_name_en)
            .filter(Boolean);
        return Array.from(new Set(cats)) as string[];
    }, [bundles, i18n.language]);

    // Statistics
    const stats = useMemo(() => {
        const total = bundles.length;
        const active = bundles.filter(b => b.status === 'active').length;
        const draft = bundles.filter(b => b.status === 'draft').length;
        const featured = bundles.filter(b => b.featured).length;
        return { total, active, draft, featured };
    }, [bundles]);

    // Filter bundles
    const filteredBundles = useMemo(() => {
        return (bundles || []).filter(b => {
            const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (b.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());
            
            const catName = i18n.language === 'ar' ? (b.category_name_ar ?? b.category_name_en) : b.category_name_en;
            const matchesCategory = !filterCategory || catName === filterCategory;
            const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
            const matchesType = filterType === 'all' || b.bundle_type === filterType;

            return matchesSearch && matchesCategory && matchesStatus && matchesType;
        });
    }, [bundles, searchTerm, filterCategory, filterStatus, filterType, i18n.language]);

    // Delete bundle handler
    const handleDelete = async (id: number, name: string) => {
        if (confirm(i18n.language === 'ar' ? `هل أنت متأكد من حذف الباقة "${name}"؟` : `Are you sure you want to delete bundle "${name}"?`)) {
            const result = await deleteBundleAction(id);
            if (result.success) {
                toast.success(i18n.language === 'ar' ? "تم حذف الباقة بنجاح" : "Bundle deleted successfully");
                router.refresh();
            } else {
                toast.error(result.error);
            }
        }
    };

    // Duplicate bundle handler
    const handleDuplicate = async (id: number) => {
        const result = await duplicateBundleAction(id);
        if (result.success) {
            toast.success(i18n.language === 'ar' ? "تم نسخ الباقة بنجاح" : "Bundle duplicated successfully");
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const clearFilters = () => {
        setFilterCategory(null);
        setFilterStatus('all');
        setFilterType('all');
        setSearchTerm("");
        setIsFilterOpen(false);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: i18n.language === 'ar' ? 'نشط' : 'Active' };
            case 'hidden':
                return { bg: 'bg-amber-100', text: 'text-amber-700', label: i18n.language === 'ar' ? 'مخفي' : 'Hidden' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-700', label: i18n.language === 'ar' ? 'مسودة' : 'Draft' };
        }
    };

    const getBundleTypeBadge = (type: string) => {
        switch (type) {
            case 'fixed':
                return { bg: 'bg-blue-50 border-blue-200 text-blue-700', label: i18n.language === 'ar' ? 'باقة ثابتة' : 'Fixed Bundle' };
            case 'build_your_own':
                return { bg: 'bg-violet-50 border-violet-200 text-violet-700', label: i18n.language === 'ar' ? 'اصنع باقتك' : 'Build Your Own' };
            case 'mix_and_match':
                return { bg: 'bg-amber-50 border-amber-200 text-amber-700', label: i18n.language === 'ar' ? 'اختر وركّب' : 'Mix & Match' };
            default:
                return { bg: 'bg-gray-50 border-gray-200 text-gray-700', label: type };
        }
    };

    const getPricingTypeLabel = (type: string) => {
        switch (type) {
            case 'fixed_price':
                return i18n.language === 'ar' ? 'سعر ثابت' : 'Fixed Price';
            case 'percentage_discount':
                return i18n.language === 'ar' ? 'خصم مئوي' : 'Percentage Discount';
            case 'fixed_amount_discount':
                return i18n.language === 'ar' ? 'خصم مبلغ ثابت' : 'Fixed Amount Discount';
            default:
                return type;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 max-w-7xl mx-auto"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 font-cairo">{i18n.language === 'ar' ? 'إدارة الباقات والعروض' : 'Bundle Management'}</h1>
                    <p className="text-xs text-gray-500 mt-1 font-cairo">{i18n.language === 'ar' ? 'إنشاء وتعديل وإدارة عروض الباقات والمنتجات المشتركة للمتجر' : 'Create, edit, and manage product packages & promotional bundles'}</p>
                </div>
                <button
                    onClick={() => router.push("/admin/products/bundles/create")}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-800 text-white text-xs font-bold rounded-xl hover:bg-primary-900 shadow-sm transition-all w-full sm:w-auto cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>{i18n.language === 'ar' ? 'إضافة باقة جديدة' : 'Add New Bundle'}</span>
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3.5 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                        <Layers className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xl font-extrabold text-gray-900 font-mono">{stats.total}</p>
                        <p className="text-[11px] font-semibold text-gray-500 font-cairo">{i18n.language === 'ar' ? 'إجمالي الباقات' : 'Total Bundles'}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3.5 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Box className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xl font-extrabold text-gray-900 font-mono">{stats.active}</p>
                        <p className="text-[11px] font-semibold text-gray-500 font-cairo">{i18n.language === 'ar' ? 'نشطة ومتوفرة' : 'Active Bundles'}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3.5 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <Archive className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-xl font-extrabold text-gray-900 font-mono">{stats.draft}</p>
                        <p className="text-[11px] font-semibold text-gray-500 font-cairo">{i18n.language === 'ar' ? 'مسودات' : 'Drafts'}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3.5 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                        <Tag className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-xl font-extrabold text-gray-900 font-mono">{stats.featured}</p>
                        <p className="text-[11px] font-semibold text-gray-500 font-cairo">{i18n.language === 'ar' ? 'عروض مميزة' : 'Featured Offers'}</p>
                    </div>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center z-20 relative">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={i18n.language === 'ar' ? 'بحث باسم الباقة أو الوصف...' : 'Search bundles by name or description...'}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-cairo focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-xs font-bold font-cairo transition-all cursor-pointer ${
                                isFilterOpen ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            <span>{i18n.language === 'ar' ? 'تصفية الفلاتر' : 'Filters'}</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 space-y-4 z-50 font-cairo"
                                >
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="font-bold text-gray-800 text-xs">{i18n.language === 'ar' ? 'خيارات التصفية' : 'Filter Options'}</span>
                                        <button onClick={clearFilters} className="text-[11px] text-red-500 hover:underline font-semibold">{i18n.language === 'ar' ? 'إعادة تعيين' : 'Clear All'}</button>
                                    </div>

                                    {/* Category Filter */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-gray-500">{i18n.language === 'ar' ? 'القسم الرئيسي' : 'Category'}</label>
                                        <select
                                            className="w-full p-2 border rounded-lg text-xs bg-gray-50 focus:bg-white"
                                            value={filterCategory || ""}
                                            onChange={(e) => setFilterCategory(e.target.value || null)}
                                        >
                                            <option value="">{i18n.language === 'ar' ? 'كل الأقسام' : 'All Categories'}</option>
                                            {uniqueCategories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status Filter */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-gray-500">{i18n.language === 'ar' ? 'حالة الباقة' : 'Status'}</label>
                                        <select
                                            className="w-full p-2 border rounded-lg text-xs bg-gray-50 focus:bg-white"
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value as any)}
                                        >
                                            <option value="all">{i18n.language === 'ar' ? 'كل الحالات' : 'All Statuses'}</option>
                                            <option value="active">{i18n.language === 'ar' ? 'نشط' : 'Active'}</option>
                                            <option value="draft">{i18n.language === 'ar' ? 'مسودة' : 'Draft'}</option>
                                            <option value="hidden">{i18n.language === 'ar' ? 'مخفي' : 'Hidden'}</option>
                                        </select>
                                    </div>

                                    {/* Type Filter */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-gray-500">{i18n.language === 'ar' ? 'نوع الباقة' : 'Bundle Type'}</label>
                                        <select
                                            className="w-full p-2 border rounded-lg text-xs bg-gray-50 focus:bg-white"
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value as any)}
                                        >
                                            <option value="all">{i18n.language === 'ar' ? 'كل الأنواع' : 'All Types'}</option>
                                            <option value="fixed">{i18n.language === 'ar' ? 'باقة ثابتة' : 'Fixed Bundle'}</option>
                                            <option value="build_your_own">{i18n.language === 'ar' ? 'اصنع باقتك' : 'Build Your Own'}</option>
                                            <option value="mix_and_match">{i18n.language === 'ar' ? 'اختر وركّب (Mix & Match)' : 'Mix & Match'}</option>
                                        </select>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-500 font-cairo">
                        <thead className="text-[11px] text-gray-700 uppercase tracking-wider bg-gray-50/80 border-b border-gray-100 font-bold">
                            <tr>
                                <th className="w-10 px-4 py-3.5 text-center"></th>
                                <th className="px-4 py-3.5">{i18n.language === 'ar' ? 'الباقة' : 'Bundle'}</th>
                                <th className="px-4 py-3.5">{i18n.language === 'ar' ? 'القسم' : 'Category'}</th>
                                <th className="px-4 py-3.5">{i18n.language === 'ar' ? 'النوع' : 'Type'}</th>
                                <th className="px-4 py-3.5 text-center">{i18n.language === 'ar' ? 'المنتجات' : 'Items'}</th>
                                <th className="px-4 py-3.5 text-right">{i18n.language === 'ar' ? 'السعر الأصلي' : 'Original Price'}</th>
                                <th className="px-4 py-3.5 text-right">{i18n.language === 'ar' ? 'سعر الباقة' : 'Bundle Price'}</th>
                                <th className="px-4 py-3.5 text-center">{i18n.language === 'ar' ? 'الحالة' : 'Status'}</th>
                                <th className="px-4 py-3.5 text-center">{i18n.language === 'ar' ? 'تاريخ الإنشاء' : 'Created'}</th>
                                <th className="px-4 py-3.5 text-right">{i18n.language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBundles.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-16 text-center text-gray-400 font-cairo">
                                        <Layers className="w-10 h-10 mx-auto text-gray-300 mb-2 stroke-1" />
                                        <p className="text-sm font-semibold">{i18n.language === 'ar' ? 'لا توجد باقات تطابق معايير البحث.' : 'No bundles match your search.'}</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredBundles.map((b) => {
                                    const isExpanded = expandedBundles.has(b.id);
                                    const badge = getStatusBadge(b.status);
                                    const typeBadge = getBundleTypeBadge(b.bundle_type);

                                    return (
                                        <Fragment key={b.id}>
                                            <tr className="hover:bg-gray-50/70 transition-colors">
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => toggleExpand(b.id)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors cursor-pointer">
                                                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-11 h-11 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 flex items-center justify-center shadow-2xs">
                                                            {b.image ? (
                                                                <Image src={b.image} alt={b.name} fill className="object-cover" />
                                                            ) : (
                                                                <Layers className="w-5 h-5 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-xs">{b.name}</div>
                                                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{b.slug}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 font-medium">
                                                    {i18n.language === 'ar' ? (b.category_name_ar ?? b.category_name_en ?? '-') : (b.category_name_en ?? '-')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${typeBadge.bg}`}>
                                                        {typeBadge.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center font-bold text-gray-700 font-mono">
                                                    {b.item_count}
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-400 font-mono">
                                                    <span className="line-through">{b.original_total.toFixed(2)} EGP</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="font-bold text-primary-900 font-mono text-xs">{b.final_price.toFixed(2)} EGP</span>
                                                    <div className="text-[10px] text-gray-400 font-normal mt-0.5">{getPricingTypeLabel(b.pricing_type)}</div>
                                                    {b.original_total > b.final_price && (
                                                        <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
                                                            {i18n.language === 'ar' 
                                                                ? `توفير ${(b.original_total - b.final_price).toFixed(2)} ج.م` 
                                                                : `Save ${(b.original_total - b.final_price).toFixed(2)} EGP`}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <select
                                                        value={b.status}
                                                        onChange={(e) => handleStatusChange(b.id, e.target.value as any)}
                                                        className={`px-2 py-1 rounded-full text-[10px] font-bold cursor-pointer border-0 outline-none transition-all shadow-2xs font-cairo ${badge.bg} ${badge.text}`}
                                                    >
                                                        <option value="active" className="bg-white text-emerald-700 font-bold">{i18n.language === 'ar' ? 'نشط' : 'Active'}</option>
                                                        <option value="draft" className="bg-white text-gray-700 font-bold">{i18n.language === 'ar' ? 'مسودة' : 'Draft'}</option>
                                                        <option value="hidden" className="bg-white text-amber-700 font-bold">{i18n.language === 'ar' ? 'مخفي' : 'Hidden'}</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 text-center text-[10px] text-gray-400 font-mono">
                                                    {formatDate(b.created_at)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => router.push(`/admin/products/bundles/${b.id}/edit`)}
                                                            className="p-1.5 text-gray-500 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                                                            title={i18n.language === 'ar' ? 'تعديل' : 'Edit'}
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDuplicate(b.id)}
                                                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                                            title={i18n.language === 'ar' ? 'نسخ مكرر' : 'Duplicate'}
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(b.id, b.name)}
                                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                            title={i18n.language === 'ar' ? 'حذف' : 'Delete'}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="bg-gray-50/60">
                                                    <td colSpan={10} className="p-4 border-b border-gray-100">
                                                        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-cairo">
                                                            {i18n.language === 'ar' ? 'محتويات ومنتجات الباقة:' : 'Bundle Product Breakdown:'}
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-cairo">
                                                            {b.items.map((item) => (
                                                                <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="relative w-9 h-9 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                                                                            {item.variant_image || item.product_image ? (
                                                                                <Image src={item.variant_image || item.product_image || ''} alt="" fill className="object-cover" />
                                                                            ) : (
                                                                                <Box className="w-4 h-4 text-gray-300" />
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-bold text-gray-900 text-xs">
                                                                                {i18n.language === 'ar' ? item.product_name_ar : item.product_name_en}
                                                                            </div>
                                                                            {item.variant_id && (
                                                                                <div className="text-[10px] text-primary-700 font-semibold mt-0.5">
                                                                                    {i18n.language === 'ar' ? item.variant_name_ar : item.variant_name_en}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-xs font-bold text-gray-800 font-mono">
                                                                            x{item.quantity} • {item.price.toFixed(2)} EGP
                                                                        </div>
                                                                        <div className="text-[9px] text-gray-400 mt-0.5">
                                                                            {i18n.language === 'ar' ? `المخزون: ${item.stock}` : `Stock: ${item.stock}`}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
