import {CartProvider} from "@/ui/providers/CartProvider";
import CartSyncer from "@/ui/providers/CartSyncer";
import React from "react";


export default async function CheckoutLayout({children}: { children: React.ReactNode }) {

    return (
        <div className="min-h-screen flex flex-col">

            <CartSyncer/>
            <CartProvider>
                <main className="flex-1">{children}</main>
            </CartProvider>
            {/* Footer */}
        </div>
    );
}
