"use client";

import {Globe} from "lucide-react";
import {useTranslation} from "@/ui/providers/TranslationProvider";
import {gerlachSans as englishFont, muslimah as arabicFont,} from "@/lib/fonts";

export default function LanguageSwitcher() {
    const {language, switchLanguage} = useTranslation();

    const toggleLanguage = () => {
        const newLanguage = language === "en" ? "ar" : "en";
        switchLanguage(newLanguage);
    };
    const fontClass =
        language === "en"
            ? `font-bold ${arabicFont.className}`
            : `font-medium ${englishFont.className}`;

    return (
        <button
            onClick={toggleLanguage}
            className="flex md:flex-col flex-row-reverse items-center text-default justify-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
            aria-label="Switch language"
        >
            <Globe className="w-7 h-7  text-primary-700"/>
            <span className={`text-primary-800 text-sm mt-1 ${fontClass}`}>
        {language === "en" ? "العربية" : "English"}
      </span>
        </button>
    );
}
