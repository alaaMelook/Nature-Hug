"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type Language = "en" | "ar";

interface TranslationContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    en: {
        // Common
        dashboard: "Dashboard",
        customers: "Customers",
        materials: "Materials",
        products: "Products",
        orders: "Orders",
        analytics: "Analytics",
        people: "People",
        finance: "Finance",
        reports: "Reports",
        settings: "Settings",
        profile: "Profile",
        logout: "Logout",
        backToSite: "Back to Site",
        welcomeBack: "Welcome back",
        adminPanel: "Admin Panel",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        create: "Create",
        search: "Search",
        status: "Status",
        actions: "Actions",

        // Materials
        inventory: "Inventory",
        suppliers: "Suppliers",
        production: "Production",
        bom: "Bill of Materials",
        costing: "Costing",
        movements: "Movements",

        // Orders
        newOrders: "New Orders",
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled",

        // People
        teamMembers: "Team Members",
        couriers: "Couriers",

        // Not implemented
        notImplemented: "Not Implemented Yet",
        comingSoon: "Coming Soon",
        underConstruction: "This page is under construction",
    },
    ar: {
        // Common
        dashboard: "لوحة التحكم",
        customers: "العملاء",
        materials: "المواد",
        products: "المنتجات",
        orders: "الطلبات",
        analytics: "التحليلات",
        people: "الأشخاص",
        finance: "المالية",
        reports: "التقارير",
        settings: "الإعدادات",
        profile: "الملف الشخصي",
        logout: "تسجيل الخروج",
        backToSite: "العودة للموقع",
        welcomeBack: "مرحباً بعودتك",
        adminPanel: "لوحة الإدارة",
        save: "حفظ",
        cancel: "إلغاء",
        delete: "حذف",
        edit: "تعديل",
        create: "إنشاء",
        search: "بحث",
        status: "الحالة",
        actions: "الإجراءات",

        // Materials
        inventory: "المخزون",
        suppliers: "الموردين",
        production: "الإنتاج",
        bom: "قائمة المواد",
        costing: "التكاليف",
        movements: "الحركات",

        // Orders
        newOrders: "طلبات جديدة",
        processing: "قيد المعالجة",
        shipped: "تم الشحن",
        delivered: "تم التوصيل",
        cancelled: "ملغي",

        // People
        teamMembers: "أعضاء الفريق",
        couriers: "المندوبين",

        // Not implemented
        notImplemented: "غير متوفر حالياً",
        comingSoon: "قريباً",
        underConstruction: "هذه الصفحة قيد الإنشاء",
    },
};

const TranslationContext = createContext<TranslationContextType | undefined>(
    undefined
);

export function TranslationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [language, setLanguage] = useState<Language>("en");

    const t = useCallback(
        (key: string) => {
            return translations[language][key as keyof typeof translations.en] || key;
        },
        [language]
    );

    return (
        <TranslationContext.Provider value={{ language, setLanguage, t }}>
            <div dir={language === "ar" ? "rtl" : "ltr"}>{children}</div>
        </TranslationContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(TranslationContext);
    if (context === undefined) {
        throw new Error("useTranslation must be used within a TranslationProvider");
    }
    return context;
}