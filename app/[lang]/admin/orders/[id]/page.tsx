import { Orders } from "@/domain/use-case/admin/orders";
import { OrderDetailsScreen } from "@/ui/client-screens/admin/order-details-screen";
import { notFound } from "next/navigation";

export default async function OrderPage({ params }: { params: { id: string } }) {
    const ordersUseCase = new Orders();
    const id = (await params).id;
    const order = await ordersUseCase.getById(id);

    if (!order) {
        notFound();
    }

    return <OrderDetailsScreen order={order} />;
}
