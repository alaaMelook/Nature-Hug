import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

import { languages, Lang } from "@/lib/i18n/config";
import React from "react";
import FontProvider from "@/ui/providers/FontProvider";
import { Toaster } from "sonner";
import I18nProvider from "@/ui/providers/i18nProvider";
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
    title: "Nature Hug",
    description: "Natural Skincare Store",
};

export default async function RootLayoutRootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const paramsResult = await params;
    const lang = languages.includes(paramsResult.lang as Lang) ? (paramsResult.lang as Lang) : "ar";
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
                <meta name="keywords" content="Nature Hug, Natural Skincare, Skincare Products, Skincare Store" />
                <meta name="robots" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="description" content="Natural Skincare Store" />
                <meta name="og:title" content="Nature Hug" />
                <meta name="og:description" content="Natural Skincare Store" />
                <meta name="og:type" content="website" />
                <meta name="designer" content="Katherine Ashraf/@katie__space" />
                <meta name="developer" content="Katherine Ashraf/@katie__space" />
                <meta name="author" content="Katherine Ashraf/@katie__space" />
                <meta name="og:url" content="https://naturehug.com" />
                <meta name="og:image" content="https://naturehug.com/og-image.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Nature Hug" />
                <meta name="twitter:description" content="Natural Skincare Store" />
                <meta name="twitter:image" content="https://naturehug.com/og-image.jpg" />
                <meta name="old_website" content="https://naturehug.shop" />
                {/* End Google Tag Manager */}


            </head>
            <body className="bg-gray-50 min-h-screen color-text flex flex-col">

                {/* Google Tag Manager (noscript) */}
                <noscript>
                    <iframe
                        src="https://www.googletagmanager.com/ns.html?id=GTM-MRZ8RP3M"
                        height="0"
                        width="0"
                        style={{ display: "none", visibility: "hidden" }}
                    ></iframe>
                </noscript>
                <I18nProvider lang={lang}>

                    <FontProvider>
                        <main className="flex-grow">
                            <NextTopLoader color="#166534" showSpinner={false} />
                            {children}
                        </main>
                        <Toaster position="top-center" richColors />
                    </FontProvider>
                </I18nProvider>

            </body>
        </html>
    );
}