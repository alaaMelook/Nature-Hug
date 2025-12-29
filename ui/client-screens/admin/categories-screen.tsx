"use client";

import { useState, useCallback } from "react";
import { PackageCheck, Plus, Trash2, Upload, Edit2 } from "lucide-react";
import { Category } from "@/domain/entities/database/category";
import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from "@/ui/hooks/admin/categories";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCategories } from "@/ui/hooks/admin/useCategories";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ImageSelector } from "@/ui/components/admin/imageSelector";

export default function CategoriesScreen({ initialCategories, initialImages }: { initialCategories: Category[]; initialImages: { image: any, url: string }[] }) {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [nameEnglish, setNameEnglish] = useState("");
    const [nameArabic, setNameArabic] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [openSelector, setOpenSelector] = useState(false);

    // Edit modal state
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editNameEn, setEditNameEn] = useState("");
    const [editNameAr, setEditNameAr] = useState("");
    const [editImage, setEditImage] = useState<string | null>(null);
    const [editSelectorOpen, setEditSelectorOpen] = useState(false);

    const refreshCategories = async () => {
        const categories = await useCategories();
        setCategories(categories);
    };

    const handleImageSelect = (image: string) => {
        setImage(image);
        setOpenSelector(false);
    };

    const handleEditImageSelect = (image: string) => {
        setEditImage(image);
        setEditSelectorOpen(false);
    };

    const handleAdd = useCallback(async () => {
        if (!nameEnglish.trim()) {
            toast.error(t("englishNameRequired"));
            return;
        }

        const result = await createCategoryAction({ name_en: nameEnglish, name_ar: nameArabic, image_url: image || undefined });

        if (result.success) {
            toast.success(t("categoryCreatedSuccessfully"));
            setNameEnglish("");
            setNameArabic("");
            setImage(null);
            refreshCategories();

        } else {
            toast.error(result.error || t("failedToCreateCategory"));
        }
    }, [nameEnglish, nameArabic, image, t]);

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

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setEditNameEn(category.name_en);
        setEditNameAr(category.name_ar || "");
        setEditImage(category.image_url || null);
    };

    const handleUpdate = useCallback(async () => {
        if (!editingCategory) return;
        if (!editNameEn.trim()) {
            toast.error(t("englishNameRequired"));
            return;
        }

        const result = await updateCategoryAction({
            id: editingCategory.id,
            name_en: editNameEn,
            name_ar: editNameAr,
            image_url: editImage || undefined
        });

        if (result.success) {
            toast.success(t("categoryUpdatedSuccessfully") || "Category updated successfully");
            setEditingCategory(null);
            refreshCategories();
        } else {
            toast.error(result.error || t("failedToUpdateCategory") || "Failed to update category");
        }
    }, [editingCategory, editNameEn, editNameAr, editImage, t]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-2xl mx-auto md:mx-5 md:w-full flex flex-col"
        >
            <h1 className="text-2xl font-bold mb-6">{t("manageCategories")}</h1>

            {/* Add Form */}
            <div className="flex flex-col md:flex-row mb-6 space-y-3 items-center bg-white p-4 rounded-lg shadow-sm border md:space-x-5 w-full">
                <div className="md:flex-2 cursor-pointer flex items-center justify-center w-24 h-24 md:h-30 md:w-30 rounded-lg border-dashed border-2 border-gray-300">
                    {image ? <Image
                        src={image}
                        alt={t("admin.categories.altImage")}
                        onClick={() => setOpenSelector(true)}
                        width={100}
                        height={100}
                        className="w-24 h-24 object-cover rounded-lg mx-auto cursor-pointer"
                    /> :

                        <Upload className="h-12 w-12 text-gray-500" onClick={() => setOpenSelector(true)} />
                    }
                </div>
                <div className="md:flex-2 flex flex-col space-y-2 w-full">

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
                    />    <button
                        onClick={handleAdd}
                        className="flex items-center px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors w-full justify-center sm:w-auto"
                    >
                        <Plus className="h-4 w-4 mr-2" /> {t("addCategory")}
                    </button>
                </div>

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
                                {c.image_url ? (
                                    <Image
                                        src={c.image_url}
                                        alt={c.name_en}
                                        width={100}
                                        height={100}
                                        className="rounded-sm"
                                    />
                                ) : <PackageCheck className="h-6 w-6 text-gray-500" />}
                                <div className="flex-1 mx-4">
                                    <p className="font-medium text-gray-900">{c.name_en}</p>
                                    {c.name_ar && (
                                        <p className="text-sm text-gray-500">{c.name_ar}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditModal(c)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                        title={t("edit")}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        title={t("delete")}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
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

            {openSelector && <ImageSelector
                images={initialImages}
                onSelect={handleImageSelect}
                onClose={() => setOpenSelector(false)}
            />}

            {/* Edit Modal */}
            <AnimatePresence>
                {editingCategory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setEditingCategory(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
                        >
                            <h2 className="text-xl font-bold mb-4">{t("editCategory") || "Edit Category"}</h2>

                            {/* Edit Image */}
                            <div className="flex justify-center mb-4">
                                <div
                                    className="cursor-pointer flex items-center justify-center w-24 h-24 rounded-lg border-dashed border-2 border-gray-300 hover:border-primary-500 transition-colors"
                                    onClick={() => setEditSelectorOpen(true)}
                                >
                                    {editImage ? (
                                        <Image
                                            src={editImage}
                                            alt="Category"
                                            width={100}
                                            height={100}
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <Upload className="h-12 w-12 text-gray-500" />
                                    )}
                                </div>
                            </div>

                            {/* Edit Name EN */}
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("englishName")}</label>
                                <input
                                    type="text"
                                    value={editNameEn}
                                    onChange={(e) => setEditNameEn(e.target.value)}
                                    className="w-full border px-3 py-2 rounded-md text-sm"
                                />
                            </div>

                            {/* Edit Name AR */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("arabicNameOptional")}</label>
                                <input
                                    type="text"
                                    value={editNameAr}
                                    onChange={(e) => setEditNameAr(e.target.value)}
                                    className="w-full border px-3 py-2 rounded-md text-sm"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditingCategory(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                                >
                                    {t("save")}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Image Selector */}
            {editSelectorOpen && <ImageSelector
                images={initialImages}
                onSelect={handleEditImageSelect}
                onClose={() => setEditSelectorOpen(false)}
            />}
        </motion.div>
    );
}
