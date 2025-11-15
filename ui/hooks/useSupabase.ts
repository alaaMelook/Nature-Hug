'use client';

import {supabase} from "@/data/datasources/supabase/client";
import {ICustomerClientRepository} from "@/data/repositories/client/iCustomerRepository";
import {useEffect, useState} from "react";
import {Customer} from "@/domain/entities/auth/customer";
import {Member} from "@/domain/entities/auth/member";

const CustomerRepoClient = new ICustomerClientRepository();

export const useSupabase = () => {
    const [user, setUser] = useState<Customer | null>(null);
    const [member, setMember] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);

    // ✅ 1. Ensure Supabase session is hydrated on mount
    useEffect(() => {
        const initSession = async () => {
            try {
                const session = await CustomerRepoClient.getSession();
                if (session?.access_token && session?.refresh_token) {
                    await supabase.auth.setSession({
                        access_token: session.access_token,
                        refresh_token: session.refresh_token,
                    });
                }

                const currentUser = await CustomerRepoClient.getCurrentUser();
                if (currentUser) {
                    const fullUser = await CustomerRepoClient.fetchCustomer(currentUser.id);
                    if (fullUser) {
                        setUser(fullUser);
                        setMember(await CustomerRepoClient.fetchMember(fullUser.id));
                    }
                }
            } catch (err) {
                console.error("[useSupabase] Failed to initialize session:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initSession();

        // ✅ 2. Subscribe to session changes
        const {
            data: {subscription},
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                setUser(null);
            } else {
                // Optionally refresh user info if you need it here
                CustomerRepoClient.getCurrentUser()
                    .then(u => u && CustomerRepoClient.fetchCustomer(u.id))
                    .then(fetched => setUser(fetched ?? null));
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const getMember = async () => {
        if (user) {
            return await CustomerRepoClient.fetchMember(user.id);
        }
        return null;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };
    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const {data} = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (data.user) {
                const fullUser = await CustomerRepoClient.fetchCustomer(data.user.id);
                setUser(fullUser);
                const fetchedMember = await CustomerRepoClient.fetchMember(fullUser!.id);
                setMember(fetchedMember);
            }
        } catch (err) {
            console.error("[useSupabase] Login failed:", err);
            setUser(null);
            setMember(null);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    return {
        user,
        member,
        loading,
        getMember,
        login,
        signOut,
    };
};
