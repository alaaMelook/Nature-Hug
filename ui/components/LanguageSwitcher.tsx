"use client";

import { gerlachSans as englishFont, muslimah as arabicFont, } from "@/lib/fonts";
import { useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";
import { i18nConfig } from "@/i18nconfig";
import i18n from "@/lib/i18n/i18nClient";
import { Globe } from "lucide-react";

export default function LanguageSwitcher({ tohover = true }: { tohover?: boolean }) {
    const { t, i18n } = useTranslation();
    const currentLocale = i18n.language;
    const router = useRouter();
    const currentPathname = usePathname();

    const toggle = () => {
        const newLocale = currentLocale === "en" ? "ar" : "en";
        const days = 30;
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        const expires = date.toUTCString();
        document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

        // redirect to the new locale path
        if (
            currentLocale === i18nConfig.defaultLocale
        ) {
            router.push('/' + newLocale + currentPathname);
        } else {
            router.push(
                currentPathname.replace(`/${currentLocale}`, `/${newLocale}`)
            );
        }
        // i18n.changeLanguage(newLocale);
        router.refresh();
    };

    const fontClass =
        currentLocale === "en"
            ? `font-bold ${arabicFont.className}`
            : `font-medium ${englishFont.className}`;

    return (
        <button
            onClick={toggle}
            className={`flex flex-col  items-center text-default justify-center sm:p-2 rounded-md ${tohover ? "hover:bg-gray-100 transition-colors duration-200" : ""}`}
            aria-label={t("components.switchLanguage")}
        >
            <Globe className="sm:w-7 sm:h-7 w-4 h-4  text-primary-700" />
            <span className={`text-primary-800 text-sm sm:mt-1 ${fontClass}`} suppressHydrationWarning>
                {currentLocale === "en" ? "العربية" : "English"}
            </span>
        </button>
    );
};