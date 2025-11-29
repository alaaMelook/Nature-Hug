import React from "react";
import { Orders } from "@/domain/use-case/admin/orders";
import { OrdersScreen } from "@/ui/client-screens/admin/orders-screen";

export default async function AllOrdersPage() {
    const ordersUseCase = new Orders();
    const orders = await ordersUseCase.getAll();

    return <OrdersScreen initialOrders={orders} />;
}