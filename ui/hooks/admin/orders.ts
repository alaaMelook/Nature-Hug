"use server"
import { Orders } from "@/domain/use-case/admin/orders";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { revalidatePath } from "next/cache";
import { Shipment } from "@/domain/entities/shipment/shipment";
import { shipmentService } from "@/lib/services/shipmentService";

const ordersUseCase = new Orders();

export async function updateOrderAction(order: Partial<OrderDetailsView> & { order_id: number }) {
    try {
        await ordersUseCase.update(order);
        revalidatePath("/[lang]/admin/orders", "page");
        revalidatePath(`/[lang]/admin/orders/${order.order_id}`, "page");
        return { success: true };
    } catch (error) {
        console.error("Failed to update order:", error);
        return { success: false, error: "Failed to update order" };
    }
}

export async function acceptOrderAction(id: string) {
    try {
        await ordersUseCase.accept(id);
        revalidatePath("/[lang]/admin/orders", "page");
        revalidatePath(`/[lang]/admin/orders/${id}`, "page");
        return { success: true };
    } catch (error) {
        console.error("Failed to accept order:", error);
        return { success: false, error: "Failed to accept order" };
    }
}

export async function rejectOrderAction(id: string) {
    try {
        await ordersUseCase.reject(id);
        revalidatePath("/[lang]/admin/orders", "page");
        revalidatePath(`/[lang]/admin/orders/${id}`, "page");
        return { success: true };
    } catch (error) {
        console.error("Failed to reject order:", error);
        return { success: false, error: "Failed to reject order" };
    }
}

export async function cancelOrderAction(id: string) {
    try {
        await ordersUseCase.cancel(id);
        revalidatePath("/[lang]/admin/orders", "page");
        revalidatePath(`/[lang]/admin/orders/${id}`, "page");
        return { success: true };
    } catch (error) {
        console.error("Failed to cancel order:", error);
        return { success: false, error: "Failed to cancel order" };
    }
}

export async function cancelShippedOrderAction(order: OrderDetailsView) {
    try {
        await ordersUseCase.cancelShipped(order);
        revalidatePath("/[lang]/admin/orders", "page");
        revalidatePath(`/[lang]/admin/orders/${order.order_id}`, "page");
        return { success: true };
    } catch (error) {
        console.error("Failed to cancel shipped order:", error);
        return { success: false, error: "Failed to cancel shipped order" };
    }
}

export async function markAsOutForDeliveryAction(order: OrderDetailsView, shipmentData: Shipment) {
    try {
        await ordersUseCase.markAsOutForDelivery(order, shipmentData);
        revalidatePath("/[lang]/admin/orders", "page");
        revalidatePath(`/[lang]/admin/orders/${order.order_id}`, "page");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to mark as out for delivery:", error);
        return { success: false, error: error.message || "Failed to mark as out for delivery" };
    }
}

export async function syncOrderStatusAction(order: OrderDetailsView) {
    if (!order.awb) return { success: true, updated: false };

    try {
        const shipmentDetails = await shipmentService.getShipmentDetails(order.awb);
        const latestStatus = shipmentDetails.shipmentInfo?.[0]?.StatusName;

        if (!latestStatus) return { success: true, updated: false };

        let updates: Partial<OrderDetailsView> = {};
        let shouldUpdate = false;

        // Logic Mapping
        if (latestStatus === "Picked Up" && order.order_status !== "shipped" && order.order_status !== "delivered") {
            updates.order_status = "shipped";
            shouldUpdate = true;
        } else if (latestStatus === "Delivered") {
            if (order.order_status !== "delivered") {
                updates.order_status = "delivered";
                shouldUpdate = true;
            }
            if (order.payment_status !== "paid") {
                updates.payment_status = "paid";
                shouldUpdate = true;
            }
        }

        if (shouldUpdate) {
            await ordersUseCase.update({ ...updates, order_id: order.order_id });
            revalidatePath("/[lang]/admin/orders", "page");
            revalidatePath(`/[lang]/admin/orders/${order.order_id}`, "page");
            return { success: true, updated: true, newStatus: updates.order_status };
        }

        return { success: true, updated: false };

    } catch (error) {
        console.error("Failed to sync order status:", error);
        return { success: false, error: "Failed to sync status" };
    }
}

export async function deleteOrderAction(orderId: number) {
    try {
        await ordersUseCase.delete(orderId);
        revalidatePath("/[lang]/admin/orders", "page");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete order:", error);
        return { success: false, error: "Failed to delete order" };
    }
}
