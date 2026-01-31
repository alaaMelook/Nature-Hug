import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";

export async function getOrderByAwbOrId(
    orderId?: string,
    awb?: string
): Promise<OrderDetailsView | null> {
    const adminRepo = new IAdminServerRepository();

    if (orderId) {
        // Try to get order by ID
        const order = await adminRepo.getOrderById(orderId);
        return order;
    }

    if (awb) {
        // Get order by AWB
        const order = await adminRepo.getOrderByAwb(awb);
        return order;
    }

    return null;
}
