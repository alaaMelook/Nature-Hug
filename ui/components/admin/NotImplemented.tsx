"use client";

import { Construction } from "lucide-react";
import { useTranslation } from "@/ui/providers/TranslationProvider";

export default function NotImplemented() {
    const { t } = useTranslation();

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 mb-6 rounded-full bg-primary-100 flex items-center justify-center">
                <Construction className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t("notImplemented")}
            </h1>
            <p className="text-gray-600 mb-6">{t("underConstruction")}</p>
            <div className="inline-flex px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {t("comingSoon")}
            </div>
        </div>
    );
}