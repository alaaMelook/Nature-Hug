import React from "react";
import { Orders } from "@/domain/use-case/admin/orders";
import { OrdersScreen } from "@/ui/client-screens/admin/orders-screen";
import { GetAllPromoCodes } from "@/domain/use-case/admin/promo-codes/getAllPromoCodes";

export default async function AllOrdersPage() {
    const [orders, promoCodes] = await Promise.all([
        new Orders().getAll(),
        new GetAllPromoCodes().execute()
    ]);

    return <OrdersScreen initialOrders={orders} promoCodes={promoCodes} />;
}