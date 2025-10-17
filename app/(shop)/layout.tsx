import Navbar from "@/ui/(shop)/components/Navbar";
import { CartProvider } from "@/providers/CartProvider";
import CartSyncer from "@/providers/CartSyncer";



export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <CartSyncer />
            <CartProvider>
                <Navbar />
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
