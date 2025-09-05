"use client";

import { translations } from "@/lib/translations";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
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
  const [isClient, setIsClient] = useState(false);

  const updateHtml = useCallback((lang: LangKey) => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    const saved =
      (localStorage.getItem("language") as LangKey) ||
      (navigator.language.split("-")[0] as LangKey) ||
      "en";

    setLanguage(saved);
    updateHtml(saved);
  }, [updateHtml]);

  const switchLanguage = useCallback((lang: LangKey) => {
    setLanguage(lang);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("language", lang);
    }
    updateHtml(lang);
  }, [updateHtml]);

  const t = useCallback((key: string): string => {
    return (
      translations[language][key] ||
      translations[language][key.toLowerCase()] ||
      key
    );
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: switchLanguage,
      isRTL: language === "ar",
      t,
    }),
    [language, switchLanguage, t]
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