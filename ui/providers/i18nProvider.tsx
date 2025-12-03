'use client'

import i18n from "@/lib/i18n/i18nClient";

import { I18nextProvider } from "react-i18next";

export default function I18nProvider({ children, lang }: { children: React.ReactNode; lang: string }) {
    // if (i18n.language !== lang) {
    //     i18n.changeLanguage(lang);
    // }
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
