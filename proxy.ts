// middleware.ts - moved to proxy.ts
import { i18nRouter } from "next-i18n-router";
import { i18nConfig } from "./i18nconfig";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-url', request.url);
    const i18nResponse = i18nRouter(request, i18nConfig);

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        i18nResponse.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // Refresh session
    await supabase.auth.getUser();

    i18nResponse.headers.set('x-url', request.url);

    return i18nResponse;
}

export const config = {
    matcher: '/((?!api|static|.*\\..*|_next).*)',
};
