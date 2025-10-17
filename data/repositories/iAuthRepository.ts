import { supabase } from "@/data/supabase/client";
import { Member } from "@/domain/entities/database/member";
import { Customer } from "@/domain/entities/database/customer";
import { AuthRepository } from "@/domain/repositories/authRepository";
import { Session, User } from "@supabase/supabase-js";
import { ProfileView } from "@/domain/entities/views/shop/profileView";
import { MemberView } from "@/domain/entities/views/admin/memberView";
import { createSupabaseServerClient } from "@/data/supabase/server";
import { supabase as clientSupabase } from "@/data/supabase/client";

export class IAuthRepository implements AuthRepository {
    private supabase: any;

    constructor(isServer: boolean = false) {
        this.supabase = isServer ? createSupabaseServerClient() : clientSupabase;
    }
    async getSession(): Promise<Session | null> {
        const { data } = await (await this.supabase).auth.getSession();
        return data.session;
    }

    async getCurrentUser(): Promise<User | null> {
        const { data } = await (await this.supabase).auth.getUser();
        return data.user;
    }

    async signInWithEmail(email: string, password: string): Promise<{ error?: string }> {
        const { error } = await (await this.supabase).auth.signInWithPassword({ email, password });
        return error ? { error: error.message } : {};
    }

    async signUpWithEmail(email: string, password: string, name?: string): Promise<{ error?: string }> {
        const { error } = await (await this.supabase).auth.signUp({
            email,
            password,
            options: { data: { name } },
        });
        return error ? { error: error.message } : {};
    }

    async signInWithGoogle(): Promise<{ error?: string }> {
        const { error } = await (await this.supabase).auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        return error ? { error: error.message } : {};
    }

    async signOut(): Promise<void> {
        await (await this.supabase).auth.signOut();
    }

    async fetchCustomer(authUserId: string): Promise<Customer> {
        const { data, error } = await (await this.supabase).schema("store")
            .from("customers")
            .select("*")
            .eq("auth_user_id", authUserId)
            .maybeSingle();
        if (error) console.error("fetchCustomer error:", error);
        return data;
    }

    async fetchMember(customerId: number): Promise<Member> {
        const { data, error } = await (await this.supabase).schema("store")
            .from("members")
            .select("*")
            .eq("user_id", customerId)
            .maybeSingle();
        if (error) console.error("fetchMember error:", error);
        return data;
    }
    async viewProfile(customerId: number): Promise<ProfileView> {
        const { data, error } = await (await this.supabase).schema('store').from('profile_view').select('*').eq('id', customerId).single();
        if (error) console.error('viewProfile error:', error);
        return data;

    }
    async viewMember(memberId: number): Promise<MemberView> {
        const { data, error } = await (await this.supabase).schema('admin').from('member_view').select('*').eq('id', memberId).single();
        if (error) console.error('viewMember error:', error);
        return data;
    }
}
