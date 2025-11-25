import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";

export class UpdateOrder {
    constructor(private repo = new IAdminServerRepository()) { }

    async execute(order: OrderDetailsView): Promise<void> {
        try {
            console.log("[UpdateOrder] execute called with:", order);
            await this.repo.updateOrder(order);
            console.log("[UpdateOrder] Order updated successfully.");
        } catch (error) {
            console.error("[UpdateOrder] Error updating order:", error);
            throw error;
        }
    }
}
