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

    async markAsOutForDelivery(order: OrderDetailsView, shipmentData: any) {
        // 1. Create Shipment
        const { shipmentService } = await import("@/lib/services/shipmentService");

        // Ensure cityId is a number
        const cityId = Number(shipmentData.cityId);
        if (isNaN(cityId)) {
            throw new Error("Invalid City ID");
        }

        const shipmentPayload = {
            ...shipmentData,
            cityId: cityId
        };

        const shipmentResult = await shipmentService.createShipment(shipmentPayload);

        if (!shipmentResult) {
            throw new Error("Failed to create shipment: No response");
        }

        // 2. Update Order with AWB and Status
        let awb = order.awb;
        let shipmentId = order.shipment_id;

        if (shipmentResult.AWB) awb = shipmentResult.AWB;
        if (shipmentResult.ShipmentID) shipmentId = shipmentResult.ShipmentID;

        return this.update({
            order_id: order.order_id,
            order_status: 'out for delivery',
            awb: awb,
            shipment_id: shipmentId
        });
    }
}