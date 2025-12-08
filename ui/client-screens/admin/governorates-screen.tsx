"use client";

import { useState, useEffect } from 'react';
import { gerlachSans as englishFont, muslimah as arabicFont, } from "@/lib/fonts";
import { useTranslation } from 'react-i18next';
import { getGovernoratesAction, updateGovernorateFeesAction } from '@/ui/hooks/admin/shippingActions';
import { Governorate } from '@/domain/entities/database/governorate';
import { toast } from 'sonner';
import { Loader2, MapPin, Search, Pencil, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function GovernoratesScreen() {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [governorates, setGovernorates] = useState<Governorate[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingSlug, setEditingSlug] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>("");

    useEffect(() => {
        fetchGovernorates();
    }, []);

    const fetchGovernorates = async () => {
        setLoading(true);
        const result = await getGovernoratesAction();
        if (result.success && result.data) {
            setGovernorates(result.data);
        } else {
            toast.error(t("failedToFetchGovernorates"));
        }
        setLoading(false);
    };

    const handleFeeChange = async (slug: string, newFee: number) => {
        const result = await updateGovernorateFeesAction(slug, newFee);
        if (result.success) {
            setGovernorates(prev => prev.map(g => g.slug === slug ? { ...g, fees: newFee } : g));
            toast.success(t("feesUpdatedSuccessfully"));
            setEditingSlug(null);
        } else {
            toast.error(t("failedToUpdateFees"));
        }
    };

    const startEditing = (g: Governorate) => {
        setEditingSlug(g.slug);
        setEditValue(g.fees.toString());
    };

    const cancelEditing = () => {
        setEditingSlug(null);
        setEditValue("");
    };

    const saveEdit = (g: Governorate) => {
        const newFee = parseFloat(editValue);
        if (isNaN(newFee)) {
            toast.error(t("invalidFeeValue"));
            return;
        }
        if (newFee === g.fees) {
            setEditingSlug(null);
            return;
        }
        handleFeeChange(g.slug, newFee);
    };

    const filteredGovernorates = governorates.filter(g =>
        g.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.name_ar.includes(searchQuery)
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-6 max-w-7xl mx-auto space-y-6"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-8 w-8 text-primary-600" />
                    {t("governorates")}
                </h1>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t("searchGovernorates")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("englishName")}</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("arabicName")}</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("shippingFees")}</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <AnimatePresence>
                                    {filteredGovernorates.map((g, index) => {
                                        const isEditing = editingSlug === g.slug;
                                        return (
                                            <motion.tr
                                                key={g.slug || index}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center ${englishFont.className}`}>
                                                    {g.name_en}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center font-semibold ${arabicFont.className}`}>
                                                    {g.name_ar}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                                    {isEditing ? (
                                                        <input
                                                            autoFocus
                                                            type="number"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit(g);
                                                                if (e.key === 'Escape') cancelEditing();
                                                            }}
                                                            className="w-24 px-2 py-1 border border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-center mx-auto block"
                                                        />
                                                    ) : (
                                                        t("{{price, currency}}", { price: g.fees })
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {isEditing ? (
                                                            <>
                                                                <button
                                                                    onClick={() => saveEdit(g)}
                                                                    className="p-1 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                                    title={t("save")}
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={cancelEditing}
                                                                    className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                                    title={t("cancel")}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => startEditing(g)}
                                                                className="p-1 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                                                                title={t("edit")}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                                {filteredGovernorates.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            {t("noGovernoratesFound")}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
