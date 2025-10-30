"use client";

import {Toaster} from "sonner";
import {QueryClient} from "@tanstack/react-query";
import {TranslationProvider} from "@/ui/providers/TranslationProvider";
import FontProvider from "@/ui/providers/FontProvider";
import React from "react";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60,
            gcTime: 1000 * 60 * 10,
        },
    },
});

export default function Providers({children}: {
    children: React.ReactNode,
}) {
    return (
        <TranslationProvider>
            <FontProvider>

                {children}
                <Toaster position="top-center" richColors/>
            </FontProvider>
        </TranslationProvider>

    );
}
