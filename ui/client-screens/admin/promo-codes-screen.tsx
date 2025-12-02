"use client";

import { useState } from "react";
import { PromoCode } from "@/domain/entities/database/promoCode";
import { deletePromoCodeAction, updatePromoCodeAction } from "@/ui/hooks/admin/promo-codes";
import { Trash2, Plus, Tag, ShoppingBag, Layers, Check, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

interface PromoCodesScreenProps {
    initialPromoCodes: PromoCode[];
}

export default function PromoCodesScreen({ initialPromoCodes }: PromoCodesScreenProps) {
    const { t } = useTranslation();
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>(initialPromoCodes);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isUpdating, setIsUpdating] = useState<number | null>(null);
    const router = useRouter();

    const handleDelete = async (id: number) => {
        if (!confirm(t("confirmDeletePromo"))) return;

        setIsDeleting(id);
        try {
            const result = await deletePromoCodeAction(id);
            if (result.success) {
                setPromoCodes(prev => prev.filter(p => p.id !== id));
                router.refresh();
            } else {
                alert(result.error || t("failedToDeletePromo"));
            }
        } catch (error) {
            console.error("Failed to delete promo code:", error);
            alert(t("failedToDeletePromo"));
        } finally {
            setIsDeleting(null);
        }
    };

    const handleToggleActive = async (promo: PromoCode) => {
        setIsUpdating(promo.id);
        try {
            const newStatus = !promo.is_active;
            const result = await updatePromoCodeAction({ id: promo.id, is_active: newStatus });

            if (result.success) {
                setPromoCodes(prev => prev.map(p =>
                    p.id === promo.id ? { ...p, is_active: newStatus } : p
                ));
                router.refresh();
            } else {
                alert(result.error || t("failedToUpdatePromo"));
            }
        } catch (error) {
            console.error("Failed to update promo code:", error);
            alert(t("failedToUpdatePromo"));
        } finally {
            setIsUpdating(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t("promoCodes")}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t("managePromoCodes")}</p>
                </div>
                <Link
                    href="/admin/promo-codes/create"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("createPromoCode")}
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 font-semibold text-gray-700">{t("code")}</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">{t("discount")}</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">{t("type")}</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">{t("scope")}</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">{t("status")}</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">{t("actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence>
                                {promoCodes.length === 0 ? (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Tag className="h-12 w-12 text-gray-300 mb-3" />
                                                <p className="text-lg font-medium text-gray-900">{t("noPromoCodes")}</p>
                                                <p className="text-sm text-gray-500">{t("createFirstPromo")}</p>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : (
                                    promoCodes.map((promo, index) => (
                                        <motion.tr
                                            key={promo.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center mr-3 text-primary-600">
                                                        <Tag className="h-4 w-4" />
                                                    </div>
                                                    <span className="font-medium text-gray-900">{promo.code}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {promo.is_bogo ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {t("buyGet", { buy: promo.bogo_buy_count, get: promo.bogo_get_count })}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {promo.percentage_off}{t("off")}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {promo.is_bogo ? t("bogo") : t("percentage")}
                                            </td>
                                            <td className="px-6 py-4">
                                                {promo.all_cart ? (
                                                    <div className="flex items-center text-gray-600">
                                                        <ShoppingBag className="h-4 w-4 mr-2 text-gray-400" />
                                                        {t("entireCart")}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-gray-600">
                                                        <Layers className="h-4 w-4 mr-2 text-gray-400" />
                                                        {t("specificItems")}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleActive(promo)}
                                                    disabled={isUpdating === promo.id}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${promo.is_active ? 'bg-primary-600' : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <span
                                                        className={`${promo.is_active ? 'translate-x-6' : 'translate-x-1'
                                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                                    />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(promo.id)}
                                                    disabled={isDeleting === promo.id}
                                                    className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                                                    title={t("deletePromo")}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
