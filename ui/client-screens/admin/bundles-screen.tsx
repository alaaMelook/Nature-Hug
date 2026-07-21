"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Plus, Filter, Trash2, Tag, Copy, Pencil, Eye, ChevronDown, ChevronRight, Package, Box, Layers, Archive } from "lucide-react";
import { BundleAdminView } from "@/domain/entities/views/admin/bundleAdminView";
import { deleteBundleAction, duplicateBundleAction } from "@/ui/hooks/admin/bundles";
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

    const getBundleTypeLabel = (type: string) => {
        switch (type) {
            case 'fixed':
                return i18n.language === 'ar' ? 'باقة ثابتة' : 'Fixed Bundle';
            case 'build_your_own':
                return i18n.language === 'ar' ? 'اصنع باقتك' : 'Build Your Own';
            case 'mix_and_match':
                return i18n.language === 'ar' ? 'تنسيق وتوفيق' : 'Mix & Match';
            default:
                return type;
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
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{i18n.language === 'ar' ? 'إدارة الباقات' : 'Bundle Management'}</h1>
                    <p className="text-sm text-gray-500 mt-1">{i18n.language === 'ar' ? 'إنشاء وتعديل وإدارة عروض الباقات والمنتجات المشتركة' : 'Create, edit, and manage product bundles and package offers'}</p>
                </div>
                <button
                    onClick={() => router.push("/admin/products/bundles/create")}
                    className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-100 transition-all w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 mx-2" />
                    {i18n.language === 'ar' ? 'إضافة باقة جديدة' : 'Add Bundle'}
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-gray-200 p-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Layers className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                        <p className="text-[11px] text-gray-500">{i18n.language === 'ar' ? 'إجمالي الباقات' : 'Total Bundles'}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Box className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-900">{stats.active}</p>
                        <p className="text-[11px] text-gray-500">{i18n.language === 'ar' ? 'نشط' : 'Active'}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Archive className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-900">{stats.draft}</p>
                        <p className="text-[11px] text-gray-500">{i18n.language === 'ar' ? 'مسودة' : 'Draft'}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-900">{stats.featured}</p>
                        <p className="text-[11px] text-gray-500">{i18n.language === 'ar' ? 'مميز' : 'Featured'}</p>
                    </div>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center z-20 relative">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={i18n.language === 'ar' ? 'بحث باسم الباقة...' : 'Search bundles by name...'}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all hover:bg-gray-50 ${isFilterOpen ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-700 bg-white'}`}
                        >
                            <Filter className="w-4 h-4" />
                            {i18n.language === 'ar' ? 'تصفية' : 'Filters'}
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 space-y-4 z-50"
                                >
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="font-semibold text-gray-700 text-sm">{i18n.language === 'ar' ? 'تصفية حسب' : 'Filter Options'}</span>
                                        <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">{i18n.language === 'ar' ? 'إعادة تعيين' : 'Clear All'}</button>
                                    </div>

                                    {/* Category Filter */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500">{i18n.language === 'ar' ? 'القسم' : 'Category'}</label>
                                        <select
                                            className="w-full p-2 border rounded-lg text-xs bg-gray-50"
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
                                        <label className="text-xs font-semibold text-gray-500">{i18n.language === 'ar' ? 'الحالة' : 'Status'}</label>
                                        <select
                                            className="w-full p-2 border rounded-lg text-xs bg-gray-50"
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
                                        <label className="text-xs font-semibold text-gray-500">{i18n.language === 'ar' ? 'نوع الباقة' : 'Bundle Type'}</label>
                                        <select
                                            className="w-full p-2 border rounded-lg text-xs bg-gray-50"
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value as any)}
                                        >
                                            <option value="all">{i18n.language === 'ar' ? 'كل الأنواع' : 'All Types'}</option>
                                            <option value="fixed">{i18n.language === 'ar' ? 'باقة ثابتة' : 'Fixed Bundle'}</option>
                                            <option value="build_your_own">{i18n.language === 'ar' ? 'اصنع باقتك' : 'Build Your Own'}</option>
                                            <option value="mix_and_match">{i18n.language === 'ar' ? 'تنسيق وتوفيق' : 'Mix & Match'}</option>
                                        </select>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="w-10 px-4 py-3"></th>
                                <th className="px-4 py-3">{i18n.language === 'ar' ? 'الباقة' : 'Bundle'}</th>
                                <th className="px-4 py-3">{i18n.language === 'ar' ? 'القسم' : 'Category'}</th>
                                <th className="px-4 py-3">{i18n.language === 'ar' ? 'النوع' : 'Type'}</th>
                                <th className="px-4 py-3 text-center">{i18n.language === 'ar' ? 'المنتجات' : 'Products'}</th>
                                <th className="px-4 py-3 text-right">{i18n.language === 'ar' ? 'السعر الأصلي' : 'Original Price'}</th>
                                <th className="px-4 py-3 text-right">{i18n.language === 'ar' ? 'سعر الباقة' : 'Bundle Price'}</th>
                                <th className="px-4 py-3 text-center">{i18n.language === 'ar' ? 'الحالة' : 'Status'}</th>
                                <th className="px-4 py-3 text-center">{i18n.language === 'ar' ? 'تاريخ الإنشاء' : 'Created Date'}</th>
                                <th className="px-4 py-3 text-right">{i18n.language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBundles.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                                        {i18n.language === 'ar' ? 'لا يوجد باقات تطابق البحث.' : 'No bundles found matching criteria.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredBundles.map((b) => {
                                    const isExpanded = expandedBundles.has(b.id);
                                    const badge = getStatusBadge(b.status);
                                    
                                    return (
                                        <>
                                            <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => toggleExpand(b.id)} className="p-1 hover:bg-gray-100 rounded">
                                                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 flex items-center justify-center">
                                                            {b.image ? (
                                                                <Image src={b.image} alt={b.name} fill className="object-cover" />
                                                            ) : (
                                                                <Layers className="w-6 h-6 text-gray-300" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{b.name}</div>
                                                            <div className="text-xs text-gray-400 font-mono mt-0.5">{b.slug}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {i18n.language === 'ar' ? (b.category_name_ar ?? b.category_name_en ?? '-') : (b.category_name_en ?? '-')}
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">
                                                        {getBundleTypeLabel(b.bundle_type)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center font-bold text-gray-700">
                                                    {b.item_count}
                                                </td>
                                                <td className="px-4 py-3 text-right line-through text-gray-400">
                                                    {b.original_total.toFixed(2)} EGP
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-primary-700">
                                                    {b.final_price.toFixed(2)} EGP
                                                    <div className="text-[10px] text-gray-400 font-normal mt-0.5">{getPricingTypeLabel(b.pricing_type)}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center text-xs text-gray-500 font-mono">
                                                    {formatDate(b.created_at)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => router.push(`/admin/products/bundles/${b.id}/edit`)}
                                                            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title={i18n.language === 'ar' ? 'تعديل' : 'Edit'}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDuplicate(b.id)}
                                                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title={i18n.language === 'ar' ? 'نسخ مكرر' : 'Duplicate'}
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(b.id, b.name)}
                                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title={i18n.language === 'ar' ? 'حذف' : 'Delete'}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="bg-gray-50/50">
                                                    <td colSpan={10} className="p-4 border-b border-gray-100">
                                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                            {i18n.language === 'ar' ? 'محتويات الباقة:' : 'Bundle Items:'}
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {b.items.map((item) => (
                                                                <div key={item.id} className="bg-white border rounded-lg p-2.5 flex items-center justify-between shadow-xs">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="relative w-9 h-9 bg-gray-50 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                                            {item.variant_image || item.product_image ? (
                                                                                <Image src={item.variant_image || item.product_image || ''} alt="" fill className="object-cover" />
                                                                            ) : (
                                                                                <Box className="w-5 h-5 text-gray-300" />
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-semibold text-gray-800 text-xs">
                                                                                {i18n.language === 'ar' ? item.product_name_ar : item.product_name_en}
                                                                            </div>
                                                                            {item.variant_id && (
                                                                                <div className="text-[10px] text-gray-400 mt-0.5">
                                                                                    {i18n.language === 'ar' ? item.variant_name_ar : item.variant_name_en}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-xs font-bold text-gray-800">
                                                                            {item.quantity} x {item.price.toFixed(2)} EGP
                                                                        </div>
                                                                        <div className="text-[9px] text-gray-400 mt-0.5">
                                                                            {i18n.language === 'ar' ? `المخزون الحالي: ${item.stock}` : `Stock: ${item.stock}`}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
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
