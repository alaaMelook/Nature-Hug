import Navbar from "@/ui/components/store/Navbar";
import {CartProvider} from "@/ui/providers/CartProvider";
import CartSyncer from "@/ui/providers/CartSyncer";
import React from "react";
import {GetCurrentUser} from "@/domain/use-case/shop/getCurrentUser";
import {GetCurrentMember} from "@/domain/use-case/admin/getCurrentMember";


export default async function ShopLayout({children}: { children: React.ReactNode }) {
    const user = await new GetCurrentUser().execute();
    const member = await new GetCurrentMember().execute();
    return (
        <div className="min-h-screen flex flex-col">
            <CartSyncer/>
            <CartProvider>
                <Navbar initialMember={member} initialUser={user}/>
                <main className="flex-1">{children}</main>
            </CartProvider>
            {/* Footer */}
            <footer className=" bg-primary-50 font-semibold text-gray-700 py-8 md:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm md:text-base" suppressHydrationWarning>
                        &copy; {new Date().getFullYear()} Hug Nature.{" "}
                        {/* {t("allRightsReserved")} */}
                    </p>
                </div>
            </footer>
        </div>
    );
}
