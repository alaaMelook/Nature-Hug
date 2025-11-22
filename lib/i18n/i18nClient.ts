import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { resources } from "@/lib/i18n/translations";
import { COOKIE_KEY } from "@/lib/constants";
import { i18nConfig } from "@/i18nconfig";



i18n
    .use(initReactI18next)
    .init({
        // lng: detectInitialLanguage(),   // 🔥 INITIAL LANGUAGE = URL
        fallbackLng: i18nConfig.defaultLocale,
        supportedLngs: i18nConfig.locales,

        preload: resources ? [] : i18nConfig.locales,
        // fallbackLng: 'ar', // default language
        resources,

        interpolation: {
            escapeValue: false, // react already safes from xss

            format: (value: any, format: string | undefined, lng: string | undefined) => {
                // 1. Check for currency format
                if (format === 'currency' && typeof value === 'number') {
                    return new Intl.NumberFormat(lng, {
                        style: 'currency',
                        currency: 'EGP', // Use your specific currency code (e.g., EGP, USD)
                    }).format(value);
                }
                if (value instanceof Date) {
                    // Use Intl.DateTimeFormat for robust date/time formatting
                    const options: Intl.DateTimeFormatOptions = format === 'time' ? {
                        hour: '2-digit',      // hh (01-12)
                        minute: '2-digit',    // mm
                        hour12: true,         // aa (AM/PM or equivalent)
                    } :
                        format === 'date' ? {
                            day: '2-digit',       // dd
                            month: '2-digit',     // MM
                            year: 'numeric',      // yyyy
                        } : {
                            hour: '2-digit',      // hh (01-12)
                            minute: '2-digit',    // mm
                            hour12: true,         // aa (AM/PM or equivalent)
                            day: '2-digit',       // dd
                            month: '2-digit',     // MM
                            year: 'numeric',      // yyyy
                        };

                    const formatted = new Intl.DateTimeFormat(lng, options).format(value);

                    return formatted;
                }
                return value;

            },

        },
        react: {
            useSuspense: true,
        },

    });

export default i18n;