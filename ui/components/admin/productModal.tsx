"use client";
import React, { use, useEffect, useState } from "react";
import { ProductAdminView, ProductVariantAdminView } from "@/domain/entities/views/admin/productAdminView";
import { Material } from "@/domain/entities/database/material";
import { Category } from "@/domain/entities/database/category";
import { useUploadImage } from "@/ui/hooks/admin/useUploadImage";
import { createProductAction } from "@/ui/hooks/admin/products";
import { GetAllCategories } from "@/domain/use-case/store/getAllCategories";
import { useCategories } from "@/ui/hooks/admin/useCategories";
import { useTranslation } from "react-i18next";

type Props = {
    onClose: () => void;
    materials?: Material[];
    initial?: Partial<ProductAdminView>;
    onSaved?: (id: number) => void;
};

export function ProductModal({ onClose, materials = [], initial, onSaved }: Props) {
    const { t } = useTranslation();
    const [form, setForm] = useState<Partial<ProductAdminView>>(initial || {});
    const [variants, setVariants] = useState<Partial<ProductVariantAdminView>[]>(initial?.variants || []);
    const [saving, setSaving] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(initial?.category?.id || undefined);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (categories.length > 0) return;
        async function loadCategories() {
            const categories = await useCategories();
            setCategories(categories);
        }

        loadCategories();

    }, []);

    useEffect(() => {
        if (initial?.category?.id) setSelectedCategoryId(initial.category.id);
    }, [initial]);

    const updateField = <K extends keyof ProductAdminView>(k: K, v: ProductAdminView[K]) => setForm(prev => ({ ...prev, [k]: v }));

    const addVariant = () => setVariants(prev => ([...prev, { name_en: "", price: 0, stock: 0 }]));
    const updateVariant = (i: number, patch: Partial<ProductVariantAdminView>) => setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, ...patch } : v));
    const removeVariant = (i: number) => setVariants(prev => prev.filter((_, idx) => idx !== i));

    async function handleUploadFile(file?: File) {
        if (!file) return '';
        const url = await useUploadImage(file);
        return url;

    }

    async function handleSave() {
        setSaving(true);
        try {
            const payload: any = { ...form, variants };
            if (selectedCategoryId) payload.category_id = selectedCategoryId;
            const data = await createProductAction(payload);
            if (data.success) {
                if (onSaved && data.id) onSaved(data.id);
                onClose();
            }
            else {
                console.error(data.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    }



    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white w-[900px] max-w-full p-6 rounded shadow-lg overflow-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">{t("addEditProduct")}</h3>
                    <button onClick={onClose} className="text-gray-500">{t("close")}</button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t("nameEn")}</label>
                        <input className="w-full border rounded p-2 text-sm" value={form.name_en || ''} onChange={(e) => updateField('name_en', e.target.value as any)} />

                        <label className="block text-sm font-medium mt-3 mb-1">{t("descriptionEn")}</label>
                        <textarea className="w-full border rounded p-2 text-sm" rows={6} value={form.description_en || ''} onChange={(e) => updateField('description_en', e.target.value as any)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t("price")}</label>
                        <input className="w-full border rounded p-2 text-sm" type="number" value={form.price || 0} onChange={(e) => updateField('price', Number(e.target.value) as any)} />

                        <label className="block text-sm font-medium mt-3 mb-1">{t("stock")}</label>
                        <input className="w-full border rounded p-2 text-sm" type="number" value={form.stock || 0} onChange={(e) => updateField('stock', Number(e.target.value) as any)} />

                        <label className="block text-sm font-medium mt-3 mb-1">{t("category")}</label>
                        <select className="w-full border rounded p-2 text-sm" value={selectedCategoryId || ''} onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : undefined)}>
                            <option value="">{t("selectCategory")}</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name_en}</option>
                            ))}
                        </select>

                        <label className="block text-sm font-medium mt-3 mb-1">{t("mainImage")}</label>
                        <input className="w-full" type="file" accept="image/*" onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const url = await handleUploadFile(f);
                            setForm(prev => ({ ...prev, image_url: url }));
                        }} />
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{t("variants")}</h4>
                        <button onClick={addVariant} className="text-sm px-2 py-1 bg-green-600 text-white rounded">{t("addVariant")}</button>
                    </div>
                    <div className="space-y-3">
                        {variants.map((v, idx) => (
                            <div key={idx} className="border rounded p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-medium">{t("variant")} {idx + 1}</div>
                                    <div className="space-x-2">
                                        <button onClick={() => removeVariant(idx)} className="text-red-600 text-sm">{t("remove")}</button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <input className="border p-2 text-sm" placeholder={t("nameEn")} value={v.name_en || ''} onChange={(e) => updateVariant(idx, { name_en: e.target.value } as any)} />
                                    <input className="border p-2 text-sm" placeholder={t("price")} type="number" value={v.price || 0} onChange={(e) => updateVariant(idx, { price: Number(e.target.value) } as any)} />
                                    <input className="border p-2 text-sm" placeholder={t("stock")} type="number" value={v.stock || 0} onChange={(e) => updateVariant(idx, { stock: Number(e.target.value) } as any)} />
                                </div>
                                <div className="mt-2">
                                    <label className="block text-xs text-gray-600 mb-1">{t("variantImage")}</label>
                                    <input type="file" accept="image/*" className="text-sm" onChange={async (e) => {
                                        const f = e.target.files?.[0];
                                        if (!f) return;
                                        const url = await handleUploadFile(f);
                                        updateVariant(idx, { image: url } as any);
                                    }} />
                                    {v.image ? (
                                        <img src={v.image} alt={`variant-${idx}-img`} className="mt-2 w-24 h-24 object-cover rounded" />
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 border rounded">{t("cancel")}</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={saving}>{saving ? t("saving") : t("saveProduct")}</button>
                </div>
            </div>
        </div>
    );
}

export default ProductModal;


