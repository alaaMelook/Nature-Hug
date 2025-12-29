'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";
import { cookies, headers } from "next/headers";

export async function signup(formData: FormData) {
    const supabase = await createSupabaseServerClient();

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: { full_name: formData.get('fullName'), phone: formData.get('phone') },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/signup/auth`,
        }

    }
    const { error } = await supabase.auth.signUp(data);

    if (error) {
        redirect('/login')
    }
    (await cookies()).set('email', data.email, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 2 });

    revalidatePath('/', 'layout')
    redirect('/verification')
}

export async function googleLogin() {
    const supabase = await createSupabaseServerClient();

    // Get the origin from headers for dynamic redirect
    const headersList = await headers();
    const origin = headersList.get('origin') || headersList.get('referer')?.split('/').slice(0, 3).join('/') || process.env.NEXT_PUBLIC_SITE_URL;

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/callback`,
        },
    });

    if (error) throw new Error(error.message);

    redirect(data.url);

}