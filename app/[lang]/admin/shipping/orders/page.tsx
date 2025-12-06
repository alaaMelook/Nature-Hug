import React from "react";
import { Orders } from "@/domain/use-case/admin/orders";
import { OrdersScreen } from "@/ui/client-screens/admin/orders-screen";

export default async function ShippedOrdersPage() {
    const ordersUseCase = new Orders();
    const allOrders = await ordersUseCase.getAll();
    // Filter for orders that have a shipment_id or awb
    const shippedOrders = allOrders.filter(order => order.shipment_id || order.awb);

    return <OrdersScreen orders={shippedOrders} />;
}
