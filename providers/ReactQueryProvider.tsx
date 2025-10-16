"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { langStore } from "@/lib/i18n/langStore";

let globalQueryClient: QueryClient | null = null;

export function getQueryClient() {
    if (!globalQueryClient) {
        globalQueryClient = new QueryClient();
    }
    return globalQueryClient;
}

export function ReactQueryProvider({ children }: { children: ReactNode }) {
    const [client] = useState(() => getQueryClient());

    // 🔥 Auto invalidate queries when language changes
    useEffect(() => {
        const unsubscribe = langStore.onChange(() => {
            client.invalidateQueries(); // refetch all data on language switch
        });
        return unsubscribe;
    }, [client]);

    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
