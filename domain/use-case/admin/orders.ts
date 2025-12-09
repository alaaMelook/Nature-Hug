import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { Shipment } from "@/domain/entities/shipment/shipment";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { shipmentService } from "@/lib/services/shipmentService";

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

    async getById(id: string) {
        try {
            return await this.repo.getOrderById(id);
        } catch (error) {
            console.error("[getOrderById] Error in execute:", error);
            throw error;
        }
    }

    async accept(id: string) {
        return this.update({ order_id: Number(id), order_status: 'processing' });
    }

    async reject(id: string) {
        return this.update({ order_id: Number(id), order_status: 'declined' });
    }

    async cancel(id: string) {
        return this.update({ order_id: Number(id), order_status: 'cancelled' });
    }

    async markAsOutForDelivery(order: OrderDetailsView, shipmentData: Shipment) {
        // 1. Create Shipment

        const shipmentResult = await shipmentService.createShipment(shipmentData);

        if (!shipmentResult) {
            throw new Error("Failed to create shipment: No response");
        }

        // 2. Update Order with AWB and Status

        const awb = shipmentResult.awb;


        return this.update({
            order_id: order.order_id,
            order_status: 'out for delivery',
            awb: awb,
        });
    }

    async cancelShipped(order: OrderDetailsView) {
        const result = await shipmentService.cancelShipment(order.awb ?? '');
        if (!result) {
            throw new Error("Failed to cancel shipment: No response");
        }
        if (result.IsCanceled) {
            return this.update({ order_id: order.order_id, order_status: 'cancelled' });
        }
        throw new Error("Failed to cancel shipment: " + result.ErrorMessage);
    }
}