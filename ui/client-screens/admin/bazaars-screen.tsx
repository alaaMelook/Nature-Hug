"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
    Store, Plus, Calendar, MapPin, Eye, Trash2,
    TrendingUp, ShoppingCart, Search, MoreVertical,
    Lock, Unlock
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Bazaar } from "@/domain/entities/database/bazaar";

interface BazaarWithStats extends Bazaar {
    totalSales: number;
    orderCount: number;
}

interface BazaarsScreenProps {
    bazaars: BazaarWithStats[];
    isPosOnly?: boolean;
}

const statusColors: Record<string, string> = {
    upcoming: "bg-blue-100 text-blue-700",
    active: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-700",
    cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, { en: string; ar: string }> = {
    upcoming: { en: "Upcoming", ar: "قادم" },
    active: { en: "Active", ar: "نشط" },
    completed: { en: "Completed", ar: "مكتمل" },
    cancelled: { en: "Cancelled", ar: "ملغي" },
};

export default function BazaarsScreen({ bazaars, isPosOnly = false }: BazaarsScreenProps) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const params = useParams();
    const lang = params?.lang as string;
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [salesLocked, setSalesLocked] = useState(true);

    const filtered = bazaars.filter(b => {
        // POS-only: show only active bazaars
        if (isPosOnly && b.status !== 'active') return false;
        const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.location.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || b.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            const res = await fetch(`/api/admin/bazaars/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Bazaar deleted");
                router.refresh();
            } else {
                toast.error("Failed to delete bazaar");
            }
        } catch {
            toast.error("Failed to delete bazaar");
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-6 max-w-7xl mx-auto"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Store className="text-primary-600" size={28} />
                        {isPosOnly
                            ? (i18n.language === 'ar' ? 'نقطة البيع' : 'Point of Sale')
                            : (i18n.language === 'ar' ? 'البازارات' : 'Bazaars')}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isPosOnly
                            ? (i18n.language === 'ar' ? 'اختار البازار لبدء البيع' : 'Select a bazaar to start selling')
                            : (i18n.language === 'ar' ? 'إدارة البازارات والأحداث الخارجية' : 'Manage bazaars and offline events')}
                    </p>
                </div>
                {!isPosOnly && (
                    <Link
                        href={`/${lang}/admin/bazaars/create`}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
                    >
                        <Plus size={18} />
                        {i18n.language === 'ar' ? 'بازار جديد' : 'New Bazaar'}
                    </Link>
                )}
            </div>

            {/* Summary Cards - hidden for POS-only */}
            {!isPosOnly && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: i18n.language === 'ar' ? 'الكل' : 'Total', value: bazaars.length, color: 'bg-gray-50 border-gray-200', isSales: false },
                        { label: i18n.language === 'ar' ? 'نشط' : 'Active', value: bazaars.filter(b => b.status === 'active').length, color: 'bg-green-50 border-green-200', isSales: false },
                        { label: i18n.language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales', value: `${bazaars.reduce((a, b) => a + b.totalSales, 0).toLocaleString()} EGP`, color: 'bg-blue-50 border-blue-200', isSales: true },
                        { label: i18n.language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders', value: bazaars.reduce((a, b) => a + b.orderCount, 0), color: 'bg-purple-50 border-purple-200', isSales: false },
                    ].map((card, i) => (
                        <div key={i} className={`${card.color} border rounded-xl p-4 relative`}>
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-500 uppercase">{card.label}</p>
                                {card.isSales && (
                                    <button
                                        onClick={() => setSalesLocked(!salesLocked)}
                                        className="p-1 hover:bg-white/60 rounded-md transition-colors"
                                        title={salesLocked ? (i18n.language === 'ar' ? 'إظهار المبيعات' : 'Show sales') : (i18n.language === 'ar' ? 'إخفاء المبيعات' : 'Hide sales')}
                                    >
                                        {salesLocked ? <Lock size={14} className="text-gray-400" /> : <Unlock size={14} className="text-gray-400" />}
                                    </button>
                                )}
                            </div>
                            <p className="text-xl font-bold text-gray-900 mt-1">
                                {card.isSales && salesLocked ? '******' : card.value}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters - hidden for POS-only */}
            {!isPosOnly && (
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                            placeholder={i18n.language === 'ar' ? 'بحث بالاسم أو المكان...' : 'Search by name or location...'}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none bg-white"
                    >
                        <option value="all">{i18n.language === 'ar' ? 'كل الحالات' : 'All Status'}</option>
                        {Object.entries(statusLabels).map(([key, val]) => (
                            <option key={key} value={key}>{i18n.language === 'ar' ? val.ar : val.en}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Bazaar List */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border">
                    <Store size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">
                        {i18n.language === 'ar' ? 'لا توجد بازارات' : 'No bazaars found'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                        {i18n.language === 'ar' ? 'أنشئ بازار جديد للبدء' : 'Create a new bazaar to get started'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filtered.map((bazaar) => (
                        <motion.div
                            key={bazaar.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl border hover:shadow-md transition-shadow"
                        >
                            <div className="p-4 sm:p-5">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {bazaar.name}
                                            </h3>
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[bazaar.status]}`}>
                                                {i18n.language === 'ar' ? statusLabels[bazaar.status]?.ar : statusLabels[bazaar.status]?.en}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <MapPin size={14} />
                                                {bazaar.location}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {formatDate(bazaar.start_date)} → {formatDate(bazaar.end_date)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/${lang}/admin/bazaars/${bazaar.id}${isPosOnly ? '?mode=pos' : ''}`}
                                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                                        >
                                            <Eye size={16} />
                                            {isPosOnly
                                                ? (i18n.language === 'ar' ? 'ابدأ البيع' : 'Start POS')
                                                : (i18n.language === 'ar' ? 'تفاصيل' : 'Details')}
                                        </Link>
                                        {!isPosOnly && (
                                            <button
                                                onClick={() => handleDelete(bazaar.id, bazaar.name)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Stats Row - hide for POS-only */}
                                {!isPosOnly && (
                                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-sm">
                                            <ShoppingCart size={16} className="text-gray-400" />
                                            <span className="text-gray-600">
                                                <span className="font-semibold text-gray-900">{bazaar.orderCount}</span> {i18n.language === 'ar' ? 'طلب' : 'orders'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <TrendingUp size={16} className="text-gray-400" />
                                            <span className="text-gray-600">
                                                <span className="font-semibold text-gray-900">{salesLocked ? '******' : `${bazaar.totalSales.toLocaleString()} EGP`}</span> {i18n.language === 'ar' ? 'مبيعات' : 'sales'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
