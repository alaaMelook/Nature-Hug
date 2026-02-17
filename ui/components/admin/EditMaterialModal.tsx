'use client';
import { useState, useEffect } from "react";
import { Material, Unit, MaterialType } from "@/domain/entities/database/material";
import { updateMaterial } from "@/ui/hooks/admin/useMaterials";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";
import { units, materialTypes } from "@/lib/utils/enums";
import { motion, AnimatePresence } from "framer-motion";

interface EditMaterialModalProps {
    isOpen: boolean;
    onClose: () => void;
    material: Material | null;
    onSuccess: (updated: Material) => void;
}

export function EditMaterialModal({ isOpen, onClose, material, onSuccess }: EditMaterialModalProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Material>>({});

    // Initialize form data when material changes
    useEffect(() => {
        if (material) {
            setFormData({
                id: material.id,
                name: material.name,
                price_per_gram: material.price_per_gram,
                stock_grams: material.stock_grams,
                unit: material.unit,
                low_stock_threshold: material.low_stock_threshold,
                material_type: material.material_type,
            });
        }
    }, [material]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!material) return;

        setLoading(true);
        try {
            const res = await updateMaterial(formData);
            if (res.success) {
                toast.success(t("materialUpdated") || "Material updated successfully");
                onSuccess({ ...material, ...formData } as Material);
                onClose();
            } else {
                console.error('[EditMaterialModal] Update failed:', res.error);
                toast.error(res.error || t("errorUpdatingMaterial") || "Error updating material");
            }
        } catch (error) {
            console.error("Error updating material:", error);
            toast.error(t("errorUpdatingMaterial") || "Error updating material");
        } finally {
            setLoading(false);
        }
    };

    if (!material) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t("editMaterial") || "Edit Material"}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-130px)]">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("materialName") || "Material Name"}
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            {/* Price per gram */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("pricePerUnit") || "Price per Unit"}
                                </label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    min="0"
                                    required
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    value={formData.price_per_gram ?? ""}
                                    onChange={(e) => setFormData({ ...formData, price_per_gram: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            {/* Stock */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("stockUnits") || "Stock"}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    value={formData.stock_grams ?? ""}
                                    onChange={(e) => setFormData({ ...formData, stock_grams: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            {/* Unit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("unit") || "Unit"}
                                </label>
                                <select
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                                    value={formData.unit ?? ""}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as Unit })}
                                >
                                    {units.map((u) => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Low Stock Threshold */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("lowStockThreshold") || "Low Stock Threshold"}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    value={formData.low_stock_threshold ?? 0}
                                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            {/* Material Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("materialType") || "Material Type"}
                                </label>
                                <select
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                                    value={formData.material_type || ""}
                                    onChange={(e) => setFormData({ ...formData, material_type: e.target.value as MaterialType })}
                                >
                                    {materialTypes.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    {t("cancel") || "Cancel"}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {loading ? t("saving") || "Saving..." : t("saveChanges") || "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
