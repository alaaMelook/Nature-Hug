import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // 1. Prepare Headers (Always done first to pass the full URL)
  const requestHeaders = new Headers(request.headers);
  // Explicitly set x-url. This helps Server Components resolve the full URL.
  requestHeaders.set('x-url', request.url);

  // 2. Initialize the response object (MUST be a mutable variable)
  let supabaseResponse = NextResponse.next({
    request: {
      ...request,
      headers: requestHeaders,
    }
  });

  // 3. Create the Supabase client and sync cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // IMPORTANT: We do NOT create a new response here.
          // We only update the cookies on the existing 'supabaseResponse' object.

          cookiesToSet.forEach(({ name, value, options }) => {
            // The primary goal is to set the cookies on the outbound response
            supabaseResponse.cookies.set(name, value, options);

            // Optional: You may also update the incoming request cookies
            // to ensure immediate consistency for subsequent logic within the middleware chain.
            // request.cookies.set(name, value); 
          });
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and getUser.

  // 4. Trigger session refresh
  await supabase.auth.getUser();

  // 5. IMPORTANT: Return the initialized response object, now containing the updated cookies.
  // If you need to redirect or rewrite based on user status (as shown in the commented block),
  // you must clone the response and copy the cookies.

  // Example: If you uncomment the redirect logic:
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user && !request.nextUrl.pathname.startsWith('/login')) {
  //     const redirectUrl = request.nextUrl.clone();
  //     redirectUrl.pathname = '/login';

  //     // Create the redirect response
  //     const redirectResponse = NextResponse.redirect(redirectUrl);

  //     // Copy the synced cookies to the redirect response
  //     redirectResponse.cookies.setAll(supabaseResponse.cookies.getAll());

  //     return redirectResponse;
  // }

  return supabaseResponse;
}