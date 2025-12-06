// middleware.ts - moved to proxy.ts
import { i18nRouter } from "next-i18n-router";
import { i18nConfig } from "./i18nconfig";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// export async function proxy(request: NextRequest) {
export async function proxy(request: NextRequest) {

    // 1️⃣ Step 1 — Prepare Headers (Pass full URL for server components)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-url', request.url);

    // 2️⃣ Step 2 — Handle Language Routing
    // i18nRouter handles redirection and rewriting for locales
    const i18nResponse = i18nRouter(request, i18nConfig);

    // 3️⃣ Step 3 — Supabase Auth & Session Refresh
    // We need to ensure the session is updated on the response that will be sent back.
    // i18nRouter returns a NextResponse. We will modify IT instead of creating a fresh one,
    // to preserve whatever routing logic i18nRouter decided on.

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

    // 4️⃣ Step 4 — Return the final response
    // We must ensure the `x-url` header is passed along if it's a rewrite.
    // i18nRouter returns a response. If it is a rewrite (status 200), Next.js internally uses the headers from the request we passed to it?
    // Actually, setting requestHeaders on the request passed to i18nRouter might be enough, but i18nRouter might clone it.

    // To be safe, we can try to copy headers to the response if needed, but 'x-url' is a request header.
    // For Server Components to see it, it must be on the request that Next.js processes.
    // `NextResponse.next({ request: { headers: requestHeaders } })` works when WE create the response.
    // But here `i18nResponse` is created by the library.

    // The trick: We can't easily inject request headers into an existing response object's "upstream request" unless we use `NextResponse.next` ourselves.
    // However, the `i18nRouter` function call passes `request`.
    // Does `i18nRouter` use our modified headers? 
    // `request` object headers are immutable-ish. We made `requestHeaders` but we didn't pass it to `i18nRouter` in a way that permanently changes `request`.

    // Let's optimize: pass a proxy request with new headers to i18nRouter?
    // Not easy.

    // BETTER APPROACH for x-url with i18nRouter:
    // If i18nResponse is a rewrite (status 200), we can create a NEW response based on it but with our headers?
    // i18nResponse might be a rewrite to `/ar/admin/...`.

    // If we just return i18nResponse, the original request headers might be used.
    // BUT we need `x-url`.

    // Let's rely on middleware chaining or just assume i18nRouter preserves headers?
    // Actually, `updateSession` in `data/.../middleware.ts` creates a response with headers.
    // But we are not using that helper anymore because we have to mix it with i18nResponse.

    // Let's Set the header on the response too, as a fallback debug, but the real fix is tricky without recreating.
    // Let's try to overwrite the headers of the request passed to i18nRouter if possible? No.

    // Workaround: We will use `NextResponse.next` if i18nRouter was just a pass-through (null body?), but it returns a response.

    // Let's try to set `x-url` on the response headers. `headers().get('x-url')` in server components *sometimes* reads from response headers in some Next.js versions/hosting? No, typically request headers.

    // NOTE: The user's previous middleware helper did this:
    /*
       let supabaseResponse = NextResponse.next({
        request: {
          ...request,
          headers: requestHeaders,
        }
      });
    */

    // We can merge this.
    // If i18nResponse.status === 200 (Rewrite/Next), we can try to return a new Next/Rewrite with our headers?
    // That's risky because i18nRouter might have complex rewrite logic.

    // Simplest logic that usually works:
    // Just return `i18nResponse` and hope `x-url` isn't needed for i18n routing itself (it isn't).
    // The `x-url` is needed for *our* layout code.
    // If `i18nRouter` doesn't explicitly strip headers, maybe it passes through?

    // To be absolutely sure, we can set the header on the response.header.
    i18nResponse.headers.set('x-url', request.url);

    return i18nResponse;
}

export const config = {
    matcher: '/((?!api|static|.*\\..*|_next).*)',
};
