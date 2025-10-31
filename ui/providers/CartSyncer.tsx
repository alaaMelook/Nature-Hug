"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {supabase} from "@/data/datasources/supabase/client";
import {ICustomerClientRepository} from "@/data/repositories/client/iCustomerRepository";

type LocalCartItem = { productId: string; quantity: number };
const CustomerRepoClient = new ICustomerClientRepository();
export default function CartSyncer() {
    const hasSynced = useRef(false);
    const isSyncing = useRef(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const sync = useCallback(async () => {
        if (!isClient || hasSynced.current || isSyncing.current) return;

        isSyncing.current = true;

        try {
            const session = await CustomerRepoClient.getSession();
            if (!session) return;

            const raw = localStorage.getItem("cart");
            if (!raw) return;

            let items: LocalCartItem[] = [];
            try {
                items = JSON.parse(raw);
            } catch {
                return;
            }

            if (!Array.isArray(items) || items.length === 0) return;

            // Use AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            clearTimeout(timeoutId);
            localStorage.removeItem("cart");
            hasSynced.current = true;
        } catch (error) {
            console.error("Cart sync failed:", error);
        } finally {
            isSyncing.current = false;
        }
    }, [supabase, isClient]);

    useEffect(() => {
        if (!isClient) return;

        const {data: {subscription}} = supabase.auth.onAuthStateChange(
            (event: string, session: any) => {
                if (event === "SIGNED_IN" && session) {
                    sync();
                }
            }
        );

        // Initial sync
        sync();

        return () => subscription.unsubscribe();
    }, [supabase, sync, isClient]);

    return null;
}