// components/LanguageSwitcher.tsx
"use client";

import { Globe } from "lucide-react";
import { useTranslation } from "@/app/components/TranslationProvider";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ar" : "en";
    setLanguage(newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex flex-col items-center text-default justify-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
      aria-label="Switch language"
    >
      <Globe className="w-5 h-5" />
      <span className="text-xs mt-1">
        {language === "en" ? "العربية" : "English"}
      </span>
    </button>
  );
}
