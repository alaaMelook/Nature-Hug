import "./globals.css";
import type { Metadata } from "next";
import { muslimah, gerlachSans } from "@/lib/fonts";
import { CartProvider } from "@/lib/CartContext";
import Navbar from "@/app/components/Navbar";

export const metadata: Metadata = {
  title: "Hug Nature",
  description: "Natural Skincare Store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${muslimah.variable} ${gerlachSans.variable}`}>
      <body className="bg-gray-50 min-h-screen">
        <CartProvider>
          <Navbar />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
