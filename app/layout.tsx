import "./globals.css";
import type { Metadata } from "next";
import { muslimah, gerlachSans } from "@/lib/fonts";
import { CartProvider } from "@/lib/CartContext";
import Navbar from "@/app/components/Navbar";
import { TranslationProvider } from "@/app/components/TranslationProvider";
import FontWrapper from "./components/FontWrapper";
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
      <body className="bg-gray-50 min-h-screen">
        <TranslationProvider>
          <FontWrapper>
            <CartProvider>
              <Navbar />
              <main>{children}</main>
            </CartProvider>
          </FontWrapper>
        </TranslationProvider>
      </body>
    </html>
  );
}
