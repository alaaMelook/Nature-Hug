// middleware.ts
import { updateSession } from "@/data/datasources/supabase/middleware";
import { i18nRouter } from "next-i18n-router";
import { i18nConfig } from "./i18nconfig";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    // 1️⃣ Step 1 — handle language routing FIRST
    const i18nResponse = i18nRouter(request, i18nConfig);

    // If i18nRouter returns a redirect or rewrite,
    // we must NOT continue to Supabase session update.
    if (i18nResponse) return i18nResponse;

    // 2️⃣ Step 2 — update Supabase session normally
    return updateSession(request);
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
