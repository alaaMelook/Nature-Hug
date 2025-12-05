import Navbar from "@/ui/components/store/Navbar";
import { CartProvider } from "@/ui/providers/CartProvider";
import CartSyncer from "@/ui/providers/CartSyncer";
import React from "react";
import { Footer } from "@/ui/components/footer";
import { WhatsappFloat } from "@/ui/components/store/whatsappFloat";



export default async function ShopLayout({ children }: { children: React.ReactNode }) {
    // const user = await new GetCurrentUser().execute();
    // const member = await new GetCurrentMember().execute();
    return (
        <div className="min-h-screen flex flex-col">
            <CartSyncer />
            <CartProvider>
                <Navbar />
                {children}
            </CartProvider>
            <WhatsappFloat />
            <Footer />
        </div>
    );
}
