import Navbar from "@/ui/components/store/Navbar";
import { CartProvider } from "@/ui/providers/CartProvider";
import CartSyncer from "@/ui/providers/CartSyncer";
import React from "react";
import { Footer } from "@/ui/components/footer";
import { WhatsappFloat } from "@/ui/components/store/whatsappFloat";


export default async function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <CartSyncer />
            <CartProvider>
                <Navbar />
                <main className="flex-1">{children}</main>
            </CartProvider>
            <WhatsappFloat />
            <Footer />
        </div>
    );
}
