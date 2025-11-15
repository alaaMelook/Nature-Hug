"use client";

import { translations } from "@/lib/i18n/translations";
import { getCurrentLanguage } from "@/lib/i18n/getCurrentLang";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface TranslationContextType {
    language: LangKey;
    switchLanguage: (lang: LangKey) => void;
    isRTL: boolean;
    t: (key: string) => string;
    onLanguageChange: (cb: (lang: LangKey) => void) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export default function TranslationProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    // client: read from cookie only
    const [language, setLanguage] = useState<LangKey>(() => {
        return (Cookies.get("language") as LangKey) || "en";
    });

    useEffect(() => {
        if (Cookies.get("language")) return;
        (async () => {
            const lang = await getCurrentLanguage();
            setLanguage(lang);
            document.documentElement.lang = lang;
            document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
            Cookies.set("language", lang, { expires: 30 });
        })();
    }, []);

    const switchLanguage = useCallback((lang: LangKey) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        Cookies.set("language", lang, { expires: 30 });
    }, []);

    const t = useCallback((key: string): string => translations[language][key] || key, [language]);

    const onLanguageChange = useCallback((cb: (lang: LangKey) => void) => {
        Cookies.set("language", language, { expires: 20000000000 });
        router.refresh();
    }, []);

    const value = useMemo(
        () => ({
            language,
            switchLanguage,
            isRTL: language === "ar",
            t,
            onLanguageChange,
        }),
        [language, switchLanguage, t, onLanguageChange]
    );

    return (
        <TranslationContext.Provider value={value}>
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={language}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </TranslationContext.Provider>
    );
}

export function useTranslation() {
    const ctx = useContext(TranslationContext);
    if (!ctx) throw new Error("useTranslation must be used within TranslationProvider");
    return ctx;
}

export function useFeatures() {
    const { language } = useTranslation();
    return translations[language].features;
}