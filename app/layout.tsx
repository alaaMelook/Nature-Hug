import type {Metadata} from "next";
import "./globals.css";
import Script from "next/script";


import React from "react";
import {TranslationProvider} from "@/ui/providers/TranslationProvider";
import FontProvider from "@/ui/providers/FontProvider";
import {Toaster} from "sonner";

export const metadata: Metadata = {
    title: "Hug Nature",
    description: "Natural Skincare Store",
};


export default async function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
        <head>
            {/* Google Tag Manager */}
            <Script
                id="gtm-script"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MRZ8RP3M');`,
                }}
            />
            <title>Nature Hug</title>
            {/* End Google Tag Manager */}


        </head>
        <body className="bg-gray-50 min-h-screen color-text">
        {/* Google Tag Manager (noscript) */}
        <noscript>
            <iframe
                src="https://www.googletagmanager.com/ns.html?id=GTM-MRZ8RP3M"
                height="0"
                width="0"
                style={{display: "none", visibility: "hidden"}}
            ></iframe>
        </noscript>
        <TranslationProvider>
            <FontProvider>

                {children}
                <Toaster position="top-center" richColors/>
            </FontProvider>
        </TranslationProvider>
        </body>
        </html>
    );
}