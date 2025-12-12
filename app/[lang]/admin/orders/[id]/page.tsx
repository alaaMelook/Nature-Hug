import { Orders } from "@/domain/use-case/admin/orders";
import { GetAllGovernorates } from "@/domain/use-case/store/getAllGovernorates";
import { OrderDetailsScreen } from "@/ui/client-screens/admin/order-details-screen";
import { notFound } from "next/navigation";

export default async function OrderPage({ params }: { params: { id: string } }) {
    const id = (await params).id;
    const order = await new Orders().getById(id);
    const governorate = await new GetAllGovernorates().bySlug(order?.governorate_slug || "");

    if (!order) {
        notFound();
    }

    return <OrderDetailsScreen order={order} governorate={governorate} />;
}
