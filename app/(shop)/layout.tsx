import Navbar from "@/ui/components/(shop)/Navbar";
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
        </div>
    );
}
