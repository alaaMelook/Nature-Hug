"use client";

import { gerlachSans, muslimah } from "@/lib/fonts";
import { translations } from "@/lib/translations";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";

type LangKey = "en" | "ar";

interface TranslationContextType {
  language: LangKey;
  setLanguage: (lang: LangKey) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

export function TranslationProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [language, setLanguage] = useState<LangKey>("en");

  useEffect(() => {
    const saved =
      (localStorage.getItem("language") as LangKey) ||
      (navigator.language.split("-")[0] as LangKey) ||
      "en";

    setLanguage(saved);
    updateHtml(saved);
  }, []);

  const updateHtml = (lang: LangKey) => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  const switchLanguage = (lang: LangKey) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    updateHtml(lang);
  };

  const t = (key: string): any => {
    return (
      translations[language][key] ||
      translations[language][key.toLowerCase()] ||
      key
    );
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage: switchLanguage,
      isRTL: language === "ar",
      t,
    }),
    [language]
  );
  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}
export function useFeatures() {
  const { language } = useTranslation();
  return translations[language].features;
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx)
    throw new Error("useTranslation must be used within TranslationProvider");
  return ctx;
}
