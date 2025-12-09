import React from "react";
import { Orders } from "@/domain/use-case/admin/orders";
import { OrdersScreen } from "@/ui/client-screens/admin/orders-screen";
import { GetAllPromoCodes } from "@/domain/use-case/admin/promo-codes/getAllPromoCodes";

export default async function AllOrdersPage() {
    const ordersUseCase = new Orders();
    const orders = await ordersUseCase.getAll();
    const promoCodes = await new GetAllPromoCodes().execute();

    return <OrdersScreen initialOrders={orders} promoCodes={promoCodes} />;
}