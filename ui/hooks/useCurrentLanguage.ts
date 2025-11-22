'use client';

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";

export function useCurrentLanguage() {
    const pathname = usePathname();
    const { i18n } = useTranslation();

    const lang = pathname.split('/')[1] === "en" ? "en" : "ar";

    useEffect(() => {
        if (i18n.language !== lang) {
            i18n.changeLanguage(lang);
        }
    }, [lang]);

    return lang;
}
