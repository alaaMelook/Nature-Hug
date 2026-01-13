'use server'
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function createSupabaseServerClient() {
    console.log("[Supabase] Creating server client.");
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)
                        );
                    } catch {
                    }
                },
            },
        }
    );
    console.log("[Supabase] Server client created.");
    return supabase;
}

/**
 * Creates a Supabase client with Service Role Key
 * This bypasses RLS and should only be used for server-side operations
 */
export async function createSupabaseServiceClient() {
    console.log("[Supabase] Creating service role client.");
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

