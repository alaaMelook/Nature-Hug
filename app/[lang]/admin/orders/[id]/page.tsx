import { Orders } from "@/domain/use-case/admin/orders";
import { GetAllGovernorates } from "@/domain/use-case/store/getAllGovernorates";
import { OrderDetailsScreen } from "@/ui/client-screens/admin/order-details-screen";
import { notFound } from "next/navigation";

export default async function OrderPage({ params }: { params: { id: string } }) {
    const ordersUseCase = new Orders();
    const id = (await params).id;
    const order = await ordersUseCase.getById(id);
    const governorate = await new GetAllGovernorates().bySlug(order?.governorate_slug || "");

    if (!order) {
        notFound();
    }

    return <OrderDetailsScreen order={order} governorate={governorate} />;
}
