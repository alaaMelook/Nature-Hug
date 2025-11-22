'use client';

import { useTranslation } from "react-i18next";
import { resources } from "@/lib/i18n/translations";
import { useCurrentLanguage } from "../useCurrentLanguage";

export function useFeatures() {
    const lang = useCurrentLanguage();
    return resources[lang]['translation'].features || [];
}