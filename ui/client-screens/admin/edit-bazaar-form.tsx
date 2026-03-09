"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, Store, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Bazaar } from "@/domain/entities/database/bazaar";

interface EditBazaarFormProps {
    bazaar: Bazaar;
}

export default function EditBazaarForm({ bazaar }: EditBazaarFormProps) {
    const { i18n } = useTranslation();
    const router = useRouter();
    const params = useParams();
    const lang = params?.lang as string;
    const isAr = i18n.language === 'ar';

    const [name, setName] = useState(bazaar.name);
    const [location, setLocation] = useState(bazaar.location || "");
    const [startDate, setStartDate] = useState(bazaar.start_date);
    const [endDate, setEndDate] = useState(bazaar.end_date);
    const [notes, setNotes] = useState(bazaar.notes || "");
    const [status, setStatus] = useState(bazaar.status);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error(isAr ? 'اسم البازار مطلوب' : 'Bazaar name is required');
            return;
        }
        if (!startDate || !endDate) {
            toast.error(isAr ? 'التاريخ مطلوب' : 'Dates are required');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/bazaars/${bazaar.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    location: location.trim(),
                    start_date: startDate,
                    end_date: endDate,
                    notes: notes.trim() || null,
                    status,
                }),
            });

            if (res.ok) {
                toast.success(isAr ? 'تم تحديث البازار بنجاح' : 'Bazaar updated successfully');
                router.push(`/${lang}/admin/bazaars/${bazaar.id}`);
                router.refresh();
            } else {
                toast.error(isAr ? 'فشل تحديث البازار' : 'Failed to update bazaar');
            }
        } catch {
            toast.error(isAr ? 'حدث خطأ' : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-6 max-w-3xl mx-auto"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Store className="text-primary-600" size={24} />
                        {isAr ? 'تعديل البازار' : 'Edit Bazaar'}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {isAr ? `تعديل بيانات "${bazaar.name}"` : `Editing "${bazaar.name}"`}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {isAr ? 'اسم البازار' : 'Bazaar Name'} *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                            placeholder={isAr ? 'مثال: بازار المعادي' : 'e.g. Maadi Bazaar'}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {isAr ? 'المكان' : 'Location'}
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                            placeholder={isAr ? 'مثال: نادي المعادي' : 'e.g. Maadi Club'}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {isAr ? 'تاريخ البداية' : 'Start Date'} *
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {isAr ? 'تاريخ النهاية' : 'End Date'} *
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {isAr ? 'الحالة' : 'Status'}
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none bg-white"
                        >
                            <option value="upcoming">{isAr ? 'قادم' : 'Upcoming'}</option>
                            <option value="active">{isAr ? 'نشط' : 'Active'}</option>
                            <option value="completed">{isAr ? 'مكتمل' : 'Completed'}</option>
                            <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {isAr ? 'ملاحظات' : 'Notes'}
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none"
                            placeholder={isAr ? 'ملاحظات إضافية...' : 'Additional notes...'}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            {isAr ? 'جاري الحفظ...' : 'Saving...'}
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            {isAr ? 'حفظ التعديلات' : 'Save Changes'}
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
}
