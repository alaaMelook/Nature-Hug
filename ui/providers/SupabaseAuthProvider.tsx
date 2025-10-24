"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { CustomerRepo } from "@/domain/repositories/customerRepository";
import { Member } from "@/domain/entities/auth/member";
import { Customer } from "@/domain/entities/auth/customer";
import { supabase } from "@/data/datasources/supabase/client";



const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Customer | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [member, setMember] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);

    // -------- Auth session listener --------
    useEffect(() => {
        async function init() {
            const sess = await CustomerRepo.getSession();
            setSession(sess);

            if (sess?.user) {
                const customer = await CustomerRepo.fetchCustomer(sess.user.id);
                setUser(customer);
                if (customer) {
                    const member = await CustomerRepo.fetchMember(customer.id);
                    setMember(member);
                }
            }
            setLoading(false);
        }

        init();

        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);

            if (session?.user) {
                const customer = await CustomerRepo.fetchCustomer(session.user.id);
                setUser(customer);
                if (customer) {
                    const member = await CustomerRepo.fetchMember(customer.id);
                    setMember(member);
                }
            } else {
                setUser(null);
                setMember(null);
            }
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    // -------- Actions --------
    const signInWithGoogle = async () => {
        const { error } = await CustomerRepo.signInWithGoogle();
        if (error) alert(error);
    };

    const signInWithEmail = (email: string, password: string) => CustomerRepo.signInWithEmail(email, password);
    const signUpWithEmail = (email: string, password: string, name?: string) => CustomerRepo.signUpWithEmail(email, password, name);
    const signOut = async () => {
        await CustomerRepo.signOut();
        setUser(null);
        setMember(null);
    };

    return (
        <SupabaseAuthContext.Provider
            value={{
                user,
                session,
                loading,
                member,
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
