"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Category } from "@/domain/entities/database/category";
import { createCategoryAction, deleteCategoryAction } from "@/ui/hooks/admin/categories";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCategories } from "@/ui/hooks/admin/useCategories";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoriesScreen({ initialCategories }: { initialCategories: Category[] }) {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [nameEnglish, setNameEnglish] = useState("");
    const [nameArabic, setNameArabic] = useState("");

    const refreshCategories = async () => {
        const categories = await useCategories();
        setCategories(categories);
    };


    const handleAdd = useCallback(async () => {
        if (!nameEnglish.trim()) {
            toast.error(t("englishNameRequired"));
            return;
        }

        const result = await createCategoryAction({ name_en: nameEnglish, name_ar: nameArabic });

        if (result.success) {
            toast.success(t("categoryCreatedSuccessfully"));
            setNameEnglish("");
            setNameArabic("");
            refreshCategories();

        } else {
            toast.error(result.error || t("failedToCreateCategory"));
        }
    }, [nameEnglish, nameArabic, t]);

    const handleDelete = useCallback(async (id: number) => {
        if (!confirm(t("confirmDeleteCategory"))) return;

        const result = await deleteCategoryAction(id);
        if (result.success) {
            toast.success(t("categoryDeletedSuccessfully"));
            // Optimistic update
            setCategories(prev => prev.filter(c => c.id !== id));
        } else {
            toast.error(result.error || t("failedToDeleteCategory"));
        }
    }, [t]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-2xl mx-auto"
        >
            <h1 className="text-2xl font-bold mb-6">{t("manageCategories")}</h1>

            {/* Add Form */}
            <div className="mb-6 space-y-3 bg-white p-4 rounded-lg shadow-sm border">
                <input
                    type="text"
                    placeholder={t("englishName")}
                    value={nameEnglish}
                    onChange={(e) => setNameEnglish(e.target.value)}
                    className="w-full border px-3 py-2 rounded-md text-sm"
                />
                <input
                    type="text"
                    placeholder={t("arabicNameOptional")}
                    value={nameArabic}
                    onChange={(e) => setNameArabic(e.target.value)}
                    className="w-full border px-3 py-2 rounded-md text-sm"
                />
                <button
                    onClick={handleAdd}
                    className="flex items-center px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors w-full justify-center sm:w-auto"
                >
                    <Plus className="h-4 w-4 mr-2" /> {t("addCategory")}
                </button>
            </div>

            {/* Categories List */}
            <div className="border rounded-md divide-y bg-white shadow-sm overflow-hidden">
                <AnimatePresence mode="popLayout">
                    {categories.length > 0 ? (
                        categories.map((c) => (
                            <motion.div
                                key={c.id}
                                layout
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">{c.name_en}</p>
                                    {c.name_ar && (
                                        <p className="text-sm text-gray-500">{c.name_ar}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(c.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title={t("delete")}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </motion.div>
                        ))
                    ) : (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-8 text-gray-500 text-sm text-center italic"
                        >
                            {t("noCategoriesFound")}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}