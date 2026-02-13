import { Orders } from "@/domain/use-case/admin/orders";
import OrderPackingScreen from "@/ui/client-screens/admin/order-packing-screen";

export default async function OrderPackingPage() {
    const orders = await new Orders().getAll();

    return <OrderPackingScreen initialOrders={orders} />;
}
