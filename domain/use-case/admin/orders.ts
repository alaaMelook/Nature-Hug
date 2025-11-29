import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";

export class Orders {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async getRecent() {
        try {
            console.log("[getRecentOrders] execute called.");
            console.log("[getRecentOrders] Calling getOrderDetails.");
            let result = await this.repo.getOrderDetails();
            console.log("[getRecentOrders] getOrderDetails result:", result);
            result = result.filter((order) => order.payment_status !== 'failed' && order.order_status === 'pending')
            return result.slice(0, 5);
        } catch (error) {
            console.error("[getRecentOrders] Error in execute:", error);
            throw error;
        }
    }

    async getAll() {
        try {
            return await this.repo.getOrderDetails();
        } catch (error) {
            console.error("[getAllOrders] Error in execute:", error);
            throw error;
        }
    }

    async update(order: Partial<OrderDetailsView>) {
        try {
            console.log("[updateOrderStatus] execute called.");
            console.log("[updateOrderStatus] Calling updateOrderStatus.");
            const result = await this.repo.updateOrder(order);
            console.log("[updateOrderStatus] updateOrderStatus result:", result);
        } catch (error) {
            console.error("[updateOrderStatus] Error in execute:", error);
            throw error;
        }
    }
}