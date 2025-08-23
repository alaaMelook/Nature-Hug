import "./globals.css";
import type { Metadata } from "next";
import { muslimah, gerlachSans } from "@/lib/fonts";
import { CartProvider } from "@/lib/CartContext";
import Navbar from "@/app/components/Navbar";
import {
  TranslationProvider,
  useTranslation,
} from "@/app/components/TranslationProvider";
export const metadata: Metadata = {
  title: "Hug Nature",
  description: "Natural Skincare Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { language } = useTranslation(); // en or ar

  const fontClass =
    language === "ar" ? muslimah.variable : gerlachSans.variable;

  return (
    <html lang={language} className={fontClass}>
      <body className="bg-gray-50 min-h-screen">
        <TranslationProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
          </CartProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
