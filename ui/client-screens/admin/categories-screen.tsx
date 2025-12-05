"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Category } from "@/domain/entities/database/category";
import { createCategoryAction, deleteCategoryAction } from "@/ui/hooks/admin/categories";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCategories } from "@/ui/hooks/admin/useCategories";
import { motion, AnimatePresence } from "framer-motion";
import { ImageSelector } from "@/ui/components/admin/imageSelector";

export default function CategoriesScreen({ initialCategories, initialImages }: { initialCategories: Category[], initialImages: { image: any; url: string }[] }) {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [nameEnglish, setNameEnglish] = useState("");
    const [nameArabic, setNameArabic] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [showImageSelector, setShowImageSelector] = useState(false);

    const refreshCategories = async () => {
        const categories = await useCategories();
        setCategories(categories);
    };


    const handleAdd = useCallback(async () => {
        if (!nameEnglish.trim()) {
            toast.error(t("englishNameRequired"));
            return;
        }

        const result = await createCategoryAction({ name_en: nameEnglish, name_ar: nameArabic, image_url: imageUrl });

        if (result.success) {
            toast.success(t("categoryCreatedSuccessfully"));
            setNameEnglish("");
            setNameArabic("");
            setImageUrl("");
            refreshCategories();

        } else {
            toast.error(result.error || t("failedToCreateCategory"));
        }
    }, [nameEnglish, nameArabic, imageUrl, t]);

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
                <div className="flex gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowImageSelector(true)}
                            className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 transition-colors overflow-hidden"
                            title={t("selectImage")}
                        >
                            {imageUrl ? (
                                <img src={imageUrl} alt="Category" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="h-5 w-5 text-gray-400" />
                            )}
                        </button>
                        {imageUrl && (
                            <button
                                onClick={() => setImageUrl("")}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                    <div className="flex-1 space-y-3">
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
                    </div>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors w-full justify-center"
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
                                <div className="flex items-center gap-3">
                                    {c.image_url ? (
                                        <img src={c.image_url} alt={c.name_en} className="w-10 h-10 rounded-md object-cover border" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center border">
                                            <ImageIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900">{c.name_en}</p>
                                        {c.name_ar && (
                                            <p className="text-sm text-gray-500">{c.name_ar}</p>
                                        )}
                                    </div>
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

            {showImageSelector && (
                <ImageSelector
                    images={initialImages}
                    // Based on previous usage in create-product-form, it seems to expect images prop.
                    // However, ImageSelector implementation shows it uses localImages state initialized from props.
                    // If we pass empty array, it will start empty. 
                    // Ideally we should fetch images or ImageSelector should handle fetching.
                    // Looking at ImageSelector code: it takes images prop. 
                    // create-product-form passes initialImages.
                    // We don't have initialImages here. 
                    // I should probably update the page wrapper to fetch images too if I want to show gallery.
                    // But the user request is "enable adding image... same way as products".
                    // Products use ImageSelector.
                    // Let's assume for now passing empty array is okay or I'll fix it if I see it's a problem.
                    // Actually, better to just pass empty array for now and maybe improve later.
                    onSelect={(url) => {
                        setImageUrl(url);
                        setShowImageSelector(false);
                    }}
                    onClose={() => setShowImageSelector(false)}
                />
            )}
        </motion.div>
    );
}