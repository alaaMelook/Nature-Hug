'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";
import { cookies } from "next/headers";

export async function signup(formData: FormData) {
    const supabase = await createSupabaseServerClient();

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const signUpData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: { full_name: formData.get('fullName'), phone: formData.get('phone') },
        }
    }
    const { data, error } = await supabase.auth.signUp(signUpData);

    if (error) {
        console.error('[Signup] Error:', error.message);
        redirect('/login?error=' + encodeURIComponent(error.message));
    }

    // When email verification is disabled, signUp returns a session
    if (data.session) {
        console.log('[Signup] User signed up and logged in successfully');
        revalidatePath('/', 'layout');
        redirect('/');
    } else if (data.user && !data.session) {
        // Email verification is still required
        console.log('[Signup] User created, email verification required');
        (await cookies()).set('email', signUpData.email, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 2 });
        revalidatePath('/', 'layout');
        redirect('/verification');
    } else {
        // Fallback - redirect to home
        revalidatePath('/', 'layout');
        redirect('/');
    }
}

export async function googleLogin() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/callback`,
        },
    });

    if (error) throw new Error(error.message);

    redirect(data.url);

}