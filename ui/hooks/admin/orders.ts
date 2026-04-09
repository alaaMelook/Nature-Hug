"use server"
import { Orders } from "@/domain/use-case/admin/orders";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { revalidatePath } from "next/cache";
import { Shipment } from "@/domain/entities/shipment/shipment";
import { shipmentService } from "@/lib/services/shipmentService";
import { GetAllGovernorates } from "@/domain/use-case/store/getAllGovernorates";

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

export async function bulkSendToShippingAction(orderIds: number[]) {
    const governoratesUseCase = new GetAllGovernorates();
    const results: { orderId: number; success: boolean; error?: string; awb?: string }[] = [];

    for (const orderId of orderIds) {
        try {
            // 1. Fetch order details
            const order = await ordersUseCase.getById(orderId.toString());
            if (!order) {
                results.push({ orderId, success: false, error: "Order not found" });
                continue;
            }

            // 2. Only process orders in 'processing' status
            if (order.order_status !== 'processing') {
                results.push({ orderId, success: false, error: `Order status is '${order.order_status}', expected 'processing'` });
                continue;
            }

            // 3. Get governorate for cityID
            const governorate = await governoratesUseCase.bySlug(order.governorate_slug || "");
            if (!governorate || !governorate.cityID) {
                results.push({ orderId, success: false, error: "Governorate not found or missing cityID" });
                continue;
            }

            // 4. Build shipment data (same logic as order-details-screen)
            const isPrepaid = order.payment_status === 'paid';
            const isCOD = order.payment_method.toLowerCase() !== 'online card';

            const calculatedDiscount = order.discount_total > 0
                ? order.discount_total
                : (order.applied_promo_code && order.promo_percentage)
                    ? order.subtotal * (order.promo_percentage / 100)
                    : 0;
            const effectiveTotal = calculatedDiscount > 0 && order.discount_total === 0
                ? order.subtotal - calculatedDiscount + order.shipping_total
                : order.final_order_total;

            const codValue = isPrepaid ? 0 : (isCOD ? effectiveTotal : 0);

            let specialInstructions = "في حالة وجود مشكلة 01090998664";
            if (order.note && order.note.trim()) {
                specialInstructions = `${order.note.trim()} | ${specialInstructions}`;
            }
            if (isPrepaid) {
                specialInstructions = `[مدفوع مسبقاً] ${specialInstructions}`;
            }

            const shipmentData: Shipment = {
                toAddress: order.shipping_street_address,
                toPhone: order.phone_numbers[0] || "",
                toMobile: order.phone_numbers[0] || "",
                cod: codValue,
                fromAddress: "",
                toConsigneeName: order.customer_name,
                toCityID: governorate.cityID,
                specialInstuctions: specialInstructions,
                pieces: order.items.reduce((acc, item) => acc + item.quantity, 0),
                fromCityID: 1078
            };

            // 5. Create shipment and update order
            await ordersUseCase.markAsOutForDelivery(order, shipmentData);

            results.push({ orderId, success: true });

        } catch (error: any) {
            console.error(`[bulkShipping] Failed for order ${orderId}:`, error);
            results.push({ orderId, success: false, error: error.message || "Unknown error" });
        }
    }

    revalidatePath("/[lang]/admin/orders", "page");

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return {
        success: failCount === 0,
        results,
        successCount,
        failCount,
        total: orderIds.length
    };
}
