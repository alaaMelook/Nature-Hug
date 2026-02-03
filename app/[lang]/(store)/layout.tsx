import Navbar from "@/ui/components/store/Navbar";
import { CartProvider } from "@/ui/providers/CartProvider";
import CartSyncer from "@/ui/providers/CartSyncer";
import React from "react";
import { Footer } from "@/ui/components/footer";
import { WhatsappFloat } from "@/ui/components/store/whatsappFloat";
import { ThemeProvider } from "@/ui/providers/ThemeProvider";
import { AnnouncementBarWrapper } from "@/ui/components/store/AnnouncementBarWrapper";



export default async function ShopLayout({ children }: { children: React.ReactNode }) {
    // const user = await new GetCurrentUser().execute();
    // const member = await new GetCurrentMember().execute();
    return (
        <ThemeProvider>
            <div className="min-h-screen flex flex-col relative">
                <CartSyncer />
                <CartProvider>
                    <Navbar />
                    <AnnouncementBarWrapper />
                    {children}
                </CartProvider>
                <WhatsappFloat />
                <Footer />
            </div>
        </ThemeProvider>
    );
}
