'use client';

import { supabase } from "@/data/datasources/supabase/client";
import { ICustomerClientRepository } from "@/data/repositories/client/iCustomerRepository";
import { useEffect, useState, useCallback } from "react";
import { Customer } from "@/domain/entities/auth/customer";
import { Member } from "@/domain/entities/auth/member";

const CustomerRepoClient = new ICustomerClientRepository();

export const useSupabase = () => {
    const [user, setUser] = useState<Customer | null>(null);
    const [member, setMember] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [isAnon, setIsAnon] = useState(false);

    /**
     * Unified function to refresh all auth state (User + Member)
     * This avoids race conditions by chaining the fetches sequentially.
     */
    const refreshSession = useCallback(async () => {
        try {
            // 1. Get the current active session from Supabase
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                // No session? Clear everything.
                loginAnonymously();
                setUser(null);
                setMember(null);
                return;
            }

            const isAnonymous = session?.user?.is_anonymous || false;
            setIsAnon(isAnonymous);

            if (isAnonymous) {
                setUser(null);
                setMember(null);
                return;
            }

            // 2. Fetch Customer Data (Database record)
            // Note: We use the ID from the session to ensure we are looking up the right user.
            const customer = await CustomerRepoClient.fetchCustomer(session.user.id);

            if (!customer) {
                // loginAnonymously();
                // If we have an auth session but no database record, treat as logged out or incomplete
                console.warn("[useSupabase] Auth session exists but Customer record not found.");
                setUser(null);
                setMember(null);
                return;
            }

            setUser(customer);

            // 3. Fetch Member Data (Role/Admin info) using the Customer ID
            const memberData = await CustomerRepoClient.fetchMember(customer.id);
            setMember(memberData);

        } catch (err) {
            console.error("[useSupabase] Failed to refresh session:", err);
            // On critical error, better to clear state than leave it stale
            setUser(null);
            setMember(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial Mount & Event Listener
    useEffect(() => {
        // Run once on mount
        refreshSession();

        // Subscribe to Supabase Auth events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[useSupabase] Auth Event: ${event}`);

            if (event === 'SIGNED_OUT') {
                // Just clear state, don't login anonymously (causes slow logout)
                setUser(null);
                setMember(null);
                setSessionToken(null);
                setLoading(false);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                // Re-fetch everything to ensure we have the latest DB data
                console.log("[useSupabase] Auth Event: SIGNED_IN with data: ", session);
                setLoading(true);
                await refreshSession();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [refreshSession]);

    /**
     * Lazy fetcher for member data, just in case expected state is missing.
     * But effectively just returns current state if valid.
     */
    const getMember = async () => {
        if (member) return member;
        // If we have a user but no member yet, try one last fetch
        if (user) {
            const m = await CustomerRepoClient.fetchMember(user.id);
            if (m) setMember(m);
            return m;
        }
        return null;
    };

    const signOut = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut();
            setUser(null);
            setMember(null);
            // State clearing is handled by onAuthStateChange('SIGNED_OUT')
        } finally {
            setSessionToken(null);
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                // While onAuthStateChange will trigger, awaiting here ensures
                // the caller (e.g. Login form) doesn't redirect until data is ready.
                setSessionToken(data.user.id);
                await refreshSession();
            }
        } catch (err) {
            console.error("[useSupabase] Login failed:", err);
            setUser(null);
            setMember(null);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    const loginAnonymously = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInAnonymously()
            if (error) throw error;
            console.log("[useSupabase] Login anonymously:", data.user);
            if (data.user) {
                // While onAuthStateChange will trigger, awaiting here ensures
                // the caller (e.g. Login form) doesn't redirect until data is ready.
                setIsAnon(true);
                setSessionToken(data.user.id);
                await refreshSession();
            }
        } catch (err) {
            console.error("[useSupabase] Login failed:", err);
            setUser(null);
            setMember(null);
            setIsAnon(false);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    return {
        sessionToken,
        user,
        member,
        loading,
        getMember,
        login,
        signOut,
    };
};
