import React from "react";
import { Orders } from "@/domain/use-case/admin/orders";
import { OrdersScreen } from "@/ui/client-screens/admin/orders-screen";
import { GetAllPromoCodes } from "@/domain/use-case/admin/promo-codes/getAllPromoCodes";
import { getAdminStaffPermissions } from "@/lib/admin-helpers";

export default async function AllOrdersPage() {
    const { customerId, role } = await getAdminStaffPermissions();
    const ordersUseCase = new Orders();

    // RBAC: Admin sees all orders, staff/moderator sees only their own
    const orders = (role === 'admin')
        ? await ordersUseCase.getAll()
        : customerId
            ? await ordersUseCase.getAllForUser(customerId)
            : [];

    const promoCodes = await new GetAllPromoCodes().execute();

    return <OrdersScreen initialOrders={orders} promoCodes={promoCodes} />;
}