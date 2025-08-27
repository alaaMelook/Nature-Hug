import "./globals.css";
import type { Metadata } from "next";
import { CartProvider } from "@/lib/CartContext";
import Navbar from "@/app/components/Navbar";
import { TranslationProvider } from "@/app/components/TranslationProvider";
import FontWrapper from "./components/FontWrapper";
import CartSyncer from "./components/CartSyncer"; // 👈 اضفنا الاستيراد هنا

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
              <Navbar />
              <CartSyncer /> {/* 👈 اضفناه هنا جوا الـ body */}
              <main>{children}</main>
            </CartProvider>
          </FontWrapper>
        </TranslationProvider>
      </body>
    </html>
  );
}
