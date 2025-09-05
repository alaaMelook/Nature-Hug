import type { Metadata } from "next";
import { CartProvider } from "@/lib/CartContext";
import ConditionalComponents from "@/app/components/ConditionalComponents";
import { TranslationProvider } from "@/app/components/TranslationProvider";
import FontWrapper from "./components/FontWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hug Nature",
  description: "Natural Skincare Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen color-text">
        <TranslationProvider>
          <FontWrapper>
            <CartProvider>
              <ConditionalComponents />
              <main>{children}</main>
            </CartProvider>
          </FontWrapper>
        </TranslationProvider>
      </body>
    </html>
  );
}