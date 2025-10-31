import {createClient} from '@supabase/supabase-js'
//  for server use only, in client-side use the normal one in ../client
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Full privileges
    {
        auth: {persistSession: false},
    }
)
