'use server';
// lib/i18n/getLangServer.ts
import { cookies, headers } from "next/headers";

export type LangKey = "en" | "ar";

export async function getCurrentLanguageServer(): Promise<LangKey> {
    const cookieStore = await cookies();
    const headersStore = await headers();
    const cookieLang = cookieStore.get("language")?.value as LangKey | undefined;
    if (cookieLang === "ar" || cookieLang === "en") return cookieLang;

    const acceptLang = headersStore.get("accept-language") ?? "";
    const browserLang = acceptLang.split(",")[0].split("-")[0] as LangKey | undefined;
    if (browserLang === "ar" || browserLang === "en") return browserLang;

    return "en";
}
