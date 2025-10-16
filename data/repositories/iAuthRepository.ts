import { supabase } from "@/data/supabase/client";
import { Member } from "@/domain/entities/database/member";
import { Customer } from "@/domain/entities/database/customer";
import { AuthRepository } from "@/domain/repositories/authRepository";
import { Session, User } from "@supabase/supabase-js";

export class IAuthRepository implements AuthRepository {
    async getSession(): Promise<Session | null> {
        const { data } = await supabase.auth.getSession();
        return data.session;
    }

    async getCurrentUser(): Promise<User | null> {
        const { data } = await supabase.auth.getUser();
        return data.user;
    }

    async signInWithEmail(email: string, password: string): Promise<{ error?: string }> {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error ? { error: error.message } : {};
    }

    async signUpWithEmail(email: string, password: string, name?: string): Promise<{ error?: string }> {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        });
        return error ? { error: error.message } : {};
    }

    async signInWithGoogle(): Promise<{ error?: string }> {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        return error ? { error: error.message } : {};
    }

    async signOut(): Promise<void> {
        await supabase.auth.signOut();
    }

    async fetchCustomer(authUserId: string): Promise<Customer | null> {
        const { data, error } = await supabase.schema("store")
            .from("customers")
            .select("*")
            .eq("auth_user_id", authUserId)
            .maybeSingle();
        if (error) console.error("fetchCustomer error:", error);
        return data;
    }

    async fetchMember(customerId: number): Promise<Member | null> {
        const { data, error } = await supabase.schema("store")
            .from("members")
            .select("*")
            .eq("user_id", customerId)
            .maybeSingle();
        if (error) console.error("fetchMember error:", error);
        return data;
    }
}
