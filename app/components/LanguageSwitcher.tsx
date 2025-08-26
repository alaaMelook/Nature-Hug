// components/LanguageSwitcher.tsx
"use client";

import { Globe } from "lucide-react";
import { useTranslation } from "@/app/components/TranslationProvider";
import {
  muslimah as arabicFont,
  gerlachSans as englishFont,
} from "@/lib/fonts";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ar" : "en";
    setLanguage(newLanguage);
  };
  const fontClass =
    language === "en"
      ? `font-semibold ${arabicFont.className}`
      : englishFont.className;

  return (
    <button
      onClick={toggleLanguage}
      className="flex md:flex-col flex-row-reverse items-center text-default justify-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
      aria-label="Switch language"
    >
      <Globe className="w-5 h-5 ml-2 md:ml-0 text-primary-900" />
      <span className={`text-primary-950 text-md mt-1 ${fontClass}`}>
        {language === "en" ? "العربية" : "English"}
      </span>
    </button>
  );
}
