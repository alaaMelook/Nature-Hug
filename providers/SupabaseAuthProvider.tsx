"use client";

import { createContext, useContext, useEffect, useState, ReactNode, SetStateAction } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/data/supabase/client"

// --- Types ---
export interface AdminUser {
    id: string;
    email: string;
    role: string;
    name: string;
    customerId: number;
}

type SupabaseAuthContextType = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isAdmin: boolean;
    adminUser: AdminUser | null;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
    signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

    // -------- Auth session listener --------
    useEffect(() => {
        async function init() {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
            setUser(data.session?.user ?? null);
            setLoading(false);
        }

        init();

        // ✅ Explicitly type event and session
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event: string, session: Session | null) => {
                setSession(session);
                setUser(session?.user ?? null);
            }
        );

        return () => listener.subscription.unsubscribe();
    }, []);


    // -------- Admin role check --------
    useEffect(() => {
        async function checkAdmin() {
            if (!user) {
                setAdminUser(null);
                return;
            }

            try {
                // 1️⃣ find customer record
                const { data: customer, error: customerError } = await supabase
                    .from("store.customers")
                    .select("id, name, email")
                    .eq("auth_user_id", user.id)
                    .maybeSingle();

                if (customerError || !customer) {
                    setAdminUser(null);
                    return;
                }

                // 2️⃣ find member record
                const { data: member, error: memberError } = await supabase
                    .from("store.members")
                    .select("role")
                    .eq("user_id", customer.id)
                    .eq("role", "admin")
                    .maybeSingle();

                if (memberError || !member) {
                    setAdminUser(null);
                    return;
                }

                // ✅ set admin user
                setAdminUser({
                    id: user.id,
                    email: user.email || "",
                    role: member.role,
                    name: customer.name || "",
                    customerId: customer.id,
                });
            } catch (error) {
                console.error("Admin check failed:", error);
                setAdminUser(null);
            }
        }

        checkAdmin();
    }, [user]);

    // -------- Auth actions --------
    async function signInWithGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) alert(error.message);
    }

    async function signInWithEmail(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        return {};
    }

    async function signUpWithEmail(email: string, password: string, name?: string) {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        });
        if (error) return { error: error.message };
        return {};
    }

    async function signOut() {
        await supabase.auth.signOut();
        setAdminUser(null);
    }

    const isAdmin = !!adminUser;

    return (
        <SupabaseAuthContext.Provider
            value={{
                user,
                session,
                loading,
                isAdmin,
                adminUser,
                signInWithGoogle,
                signInWithEmail,
                signUpWithEmail,
                signOut,
            }}
        >
            {children}
        </SupabaseAuthContext.Provider>
    );
}

export function useSupabaseAuth() {
    const ctx = useContext(SupabaseAuthContext);
    if (!ctx) throw new Error("useSupabaseAuth must be used within SupabaseAuthProvider");
    return ctx;
}
