'use server'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'

import {toast} from "sonner";
import {createSupabaseServerClient} from "@/data/datasources/supabase/server";

export async function login(formData: FormData) {
    const supabase = await createSupabaseServerClient();


    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const {error} = await supabase.auth.signInWithPassword(data);

    if (error) {
        toast.error('failed to sign up')
        redirect('/login')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createSupabaseServerClient();

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const {error} = await supabase.auth.signUp(data);

    if (error) {
        toast.error('failed to sign up')
        redirect('/login')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function googleLogin() {
    const supabase = await createSupabaseServerClient();
    const {data, error} = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/callback`,
        },
    });

    if (error) throw new Error(error.message);

    redirect(data.url);

}