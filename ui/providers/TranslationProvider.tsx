"use client";

import {translations} from "@/lib/i18n/translations";
import {getCurrentLanguage} from "@/lib/i18n/getCurrentLang";
import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import Cookies from "js-cookie";
import {langStore} from "@/lib/i18n/langStore";
import {AnimatePresence, motion} from "framer-motion";

interface TranslationContextType {
    language: LangKey;
    switchLanguage: (lang: LangKey) => void;
    isRTL: boolean;
    t: (key: string) => string;
    onLanguageChange: (cb: (lang: LangKey) => void) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export default function TranslationProvider({children}: { children: React.ReactNode }) {
    const initialLang =
        Cookies.get("language") === "ar" || Cookies.get("language") === "en"
            ? (Cookies.get("language") as LangKey)
            : "en";

    const [language, setLanguage] = useState<LangKey>(initialLang);

    useEffect(() => {
        if (Cookies.get("language")) return;
        (async () => {
            const lang = await getCurrentLanguage();
            setLanguage(lang);
            langStore.set(lang);
            document.documentElement.lang = lang;
            document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
            Cookies.set("language", lang, {expires: 30});
        })();
    }, []);

    const switchLanguage = useCallback((lang: LangKey) => {
        setLanguage(lang);
        langStore.set(lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        Cookies.set("language", lang, {expires: 30});
    }, []);

    const t = useCallback((key: string): string => translations[language][key] || key, [language]);

    const onLanguageChange = useCallback((cb: (lang: LangKey) => void) => {
        return langStore.onChange(cb);
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
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    transition={{duration: 0.15}}
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
    const {language} = useTranslation();
    return translations[language].features;
}