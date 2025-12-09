"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { insertMaterials } from "@/ui/hooks/admin/useMaterials";
import { Material, Unit, MaterialType } from "@/domain/entities/database/material";
import { units, materialTypes } from "@/lib/utils/enums";


export default function NewMaterialPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Material>>({
        name: "",
        price_per_gram: 0,
        stock_grams: 0,
        unit: units[0] as Unit,
        low_stock_threshold: 0,
        material_type: materialTypes[0] as MaterialType,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // insertMaterials expects an array
            const res = await insertMaterials([formData]);
            if (res.error) {
                toast.error(t("errorCreatingMaterial"));
            } else {
                toast.success(t("materialCreated"));
                router.push("/admin/materials");
            }
        } catch (error) {
            console.error("Error creating material:", error);
            toast.error(t("errorCreatingMaterial"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto bg-white rounded shadow">
            <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{t("addMaterial") || "Add Material"}</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        {t("materialName") || "Material Name"}
                    </label>
                    <input
                        type="text"
                        required
                        className="w-full border p-2 rounded"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                {/* Price */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        {t("pricePerGram") || "Price per gram"}
                    </label>
                    <input
                        type="number"
                        step="0.0001"
                        required
                        className="w-full border p-2 rounded"
                        value={formData.price_per_gram}
                        onChange={(e) =>
                            setFormData({ ...formData, price_per_gram: Number(e.target.value) })
                        }
                    />
                </div>

                {/* Stock */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        {t("stockGrams") || "Stock (grams)"}
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        required
                        className="w-full border p-2 rounded"
                        value={formData.stock_grams}
                        onChange={(e) =>
                            setFormData({ ...formData, stock_grams: Number(e.target.value) })
                        }
                    />
                </div>

                {/* Unit */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        {t("unit") || "Unit"}
                    </label>
                    <select
                        className="w-full border p-2 rounded"
                        value={formData.unit ?? ""}
                        onChange={(e) =>
                            setFormData({ ...formData, unit: e.target.value as Unit })
                        }
                    >
                        {units.map((u) => (
                            <option key={u} value={u}>
                                {u}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Low Stock Threshold */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        {t("lowStockThreshold") || "Low Stock Threshold"}
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        className="w-full border p-2 rounded"
                        value={formData.low_stock_threshold ?? 0}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                low_stock_threshold: Number(e.target.value),
                            })
                        }
                    />
                </div>

                {/* Material Type */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        {t("materialType") || "Material Type"}
                    </label>
                    <select
                        className="w-full border p-2 rounded"
                        value={formData.material_type}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                material_type: e.target.value as MaterialType,
                            })
                        }
                    >
                        {materialTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 border rounded hover:bg-gray-50"
                    >
                        {t("cancel") || "Cancel"}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? t("submitting") || "Submitting..." : t("saveMaterial") || "Save Material"}
                    </button>
                </div>
            </form>
        </div>
    );
}
