import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

import { languages, Lang } from "@/lib/i18n/config";
import React from "react";
import FontProvider from "@/ui/providers/FontProvider";
import { Toaster } from "sonner";
import I18nProvider from "@/ui/providers/i18nProvider";

export const metadata: Metadata = {
    title: "Hug Nature",
    description: "Natural Skincare Store",
};


export default async function RootLayoutRootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { lang: Lang };
}) {
    const lang = languages.includes(params.lang) ? params.lang : "ar";
    const dir = lang === "ar" ? "rtl" : "ltr";

    return (
        <html lang={lang} dir={dir}>
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
                        style={{ display: "none", visibility: "hidden" }}
                    ></iframe>
                </noscript>
                <I18nProvider>

                    <FontProvider>

                        {children}
                        <Toaster position="top-center" richColors />
                    </FontProvider>
                </I18nProvider>

            </body>
        </html>
    );
}