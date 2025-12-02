"use server";

import { CancelOrder } from "@/domain/use-case/store/cancelOrder";
import { revalidatePath } from "next/cache";

export async function cancelUserOrderAction(orderId: number) {
    try {
        await new CancelOrder().execute(orderId);
        revalidatePath("/orders");
        revalidatePath(`/orders/${orderId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to cancel order:", error);
        return { success: false, error: error.message || "Failed to cancel order" };
    }
}
