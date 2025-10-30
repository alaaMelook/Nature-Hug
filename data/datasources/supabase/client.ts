"use client";

import {createBrowserClient} from "@supabase/ssr";

// --- Create only once ---
export const supabase =
    createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            isSingleton: true,
        }
    );


