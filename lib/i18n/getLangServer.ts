"use server";

import { cookies, headers } from "next/headers";

/** Server-only language detector (used in layouts, pages, or middleware) */
export async function getCurrentLanguageServer(): Promise<LangKey> {
    const cookieStore = await cookies();
    const cookieLang = cookieStore.get("language")?.value as LangKey | undefined;
    if (cookieLang === "ar" || cookieLang === "en") return cookieLang;

    const headersList = await headers();
    const acceptLang = headersList.get("accept-language");
    const browserLang = acceptLang?.split(",")[0].split("-")[0] as LangKey;
    if (browserLang === "ar" || browserLang === "en") return browserLang;

    return "en";
}
