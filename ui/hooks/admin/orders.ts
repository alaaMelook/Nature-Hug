"use server"
import { Orders } from "@/domain/use-case/admin/orders";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { revalidatePath } from "next/cache";

const ordersUseCase = new Orders();

export async function updateOrderAction(order: OrderDetailsView) {
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

export async function markAsOutForDeliveryAction(order: OrderDetailsView, shipmentData: any) {
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
