import { getCurrentLanguageServer } from "@/lib/i18n/getLangServer";


export async function getCurrentLanguage(): Promise<LangKey> {
    if (typeof window === "undefined") {
        // ✅ Server-side (await required)
        return await getCurrentLanguageServer();
    } else {
        // ✅ Client-side
        const localLang =
            (localStorage.getItem("language") as LangKey) ||
            (navigator.language.split("-")[0] as LangKey) ||
            "en";
        return localLang === "ar" || localLang === "en" ? localLang : "en";
    }
}
