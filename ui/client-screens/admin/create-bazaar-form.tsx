"use client";
// Bazaar creation form component

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, Store, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CreateBazaarForm() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const params = useParams();
    const lang = params?.lang as string;

    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState<string>("upcoming");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error(i18n.language === 'ar' ? 'اسم البازار مطلوب' : 'Bazaar name is required');
            return;
        }
        if (!startDate || !endDate) {
            toast.error(i18n.language === 'ar' ? 'التاريخ مطلوب' : 'Dates are required');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/admin/bazaars", {
                method: "POST",
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
                const data = await res.json();
                toast.success(i18n.language === 'ar' ? 'تم إنشاء البازار بنجاح' : 'Bazaar created successfully');
                router.push(`/${lang}/admin/bazaars/${data.id}`);
            } else {
                toast.error(i18n.language === 'ar' ? 'فشل إنشاء البازار' : 'Failed to create bazaar');
            }
        } catch {
            toast.error(i18n.language === 'ar' ? 'حدث خطأ' : 'An error occurred');
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
                        {i18n.language === 'ar' ? 'بازار جديد' : 'New Bazaar'}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {i18n.language === 'ar' ? 'أنشئ بازار جديد وابدأ تسجيل الأوردرات' : 'Create a new bazaar and start recording orders'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {i18n.language === 'ar' ? 'اسم البازار' : 'Bazaar Name'} *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                            placeholder={i18n.language === 'ar' ? 'مثال: بازار المعادي' : 'e.g. Maadi Bazaar'}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {i18n.language === 'ar' ? 'المكان' : 'Location'}
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                            placeholder={i18n.language === 'ar' ? 'مثال: نادي المعادي' : 'e.g. Maadi Club'}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {i18n.language === 'ar' ? 'تاريخ البداية' : 'Start Date'} *
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
                                {i18n.language === 'ar' ? 'تاريخ النهاية' : 'End Date'} *
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
                            {i18n.language === 'ar' ? 'الحالة' : 'Status'}
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none bg-white"
                        >
                            <option value="upcoming">{i18n.language === 'ar' ? 'قادم' : 'Upcoming'}</option>
                            <option value="active">{i18n.language === 'ar' ? 'نشط' : 'Active'}</option>
                            <option value="completed">{i18n.language === 'ar' ? 'مكتمل' : 'Completed'}</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {i18n.language === 'ar' ? 'ملاحظات' : 'Notes'}
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none"
                            placeholder={i18n.language === 'ar' ? 'ملاحظات إضافية...' : 'Additional notes...'}
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
                            {i18n.language === 'ar' ? 'جاري الإنشاء...' : 'Creating...'}
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            {i18n.language === 'ar' ? 'إنشاء البازار' : 'Create Bazaar'}
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
}
