'use server'

import { revalidatePath } from 'next/cache';
import { Order } from "@/domain/entities/database/order";
import { OrderItem } from "@/domain/entities/database/orderItem";
import { CreateOrder } from "@/domain/use-case/store/createOrder";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";

interface AdminOrderData {
    guest_name: string;
    guest_phone: string;
    guest_phone2: string | null;
    guest_email: string | null;
    guest_address: {
        address: string;
        governorate_slug: string;
    };
    subtotal: number;
    discount_total: number;
    shipping_total: number;
    tax_total: number;
    grand_total: number;
    payment_method: string;
    payment_status: string;
    status: string;
    note: string | null;
    promo_code_id: number | null;
    items: {
        product_id: number;
        variant_id: number;
        quantity: number;
        unit_price: number;
        discount: number;
    }[];
}

export async function createAdminOrderAction(data: AdminOrderData) {
    try {
        // Get current user (admin/moderator) to track who created this order
        const currentUser = await new GetCurrentUser().execute();
        console.log("[createAdminOrderAction] Current user:", JSON.stringify(currentUser));
        console.log("[createAdminOrderAction] Current user customer_id:", currentUser?.id);

        const orderPayload: Partial<Order> = {
            guest_name: data.guest_name,
            guest_phone: data.guest_phone,
            guest_phone2: data.guest_phone2,
            guest_email: data.guest_email,
            guest_address: data.guest_address,
            subtotal: data.subtotal,
            discount_total: data.discount_total,
            shipping_total: data.shipping_total,
            tax_total: data.tax_total,
            grand_total: data.grand_total,
            payment_method: data.payment_method,
            payment_status: data.payment_status,
            status: data.status as any,
            note: data.note,
            promo_code_id: data.promo_code_id,
            // Add the creator's customer_id to track who created this order
            created_by_customer_id: currentUser?.id || null,
            items: data.items.map(item => ({
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount: item.discount
            }))
        };

        console.log("[createAdminOrderAction] Order payload - created_by_customer_id:", orderPayload.created_by_customer_id);
        console.log(`[createAdminOrderAction] Order payload - discount_total: ${orderPayload.discount_total}, subtotal: ${orderPayload.subtotal}, grand_total: ${orderPayload.grand_total}`);
        const result = await new CreateOrder().execute(orderPayload);

        // WORKAROUND: Direct update to ensure discount_total and grand_total are saved correctly
        // This is needed because the RPC might not be extracting these values from order_data JSON
        if (data.discount_total > 0 || data.shipping_total !== undefined) {
            const supabase = await createSupabaseServerClient();
            const { error: updateError } = await supabase.schema('store')
                .from('orders')
                .update({
                    discount_total: data.discount_total,
                    grand_total: data.grand_total,
                    shipping_total: data.shipping_total
                })
                .eq('id', result.order_id);

            if (updateError) {
                console.error('[createAdminOrderAction] Failed to update order totals:', updateError);
            } else {
                console.log(`[createAdminOrderAction] Successfully updated order ${result.order_id} with discount=${data.discount_total}, total=${data.grand_total}`);
            }
        }

        revalidatePath('/admin/orders', 'layout');

        return { order_id: result.order_id };
    } catch (error: any) {
        console.error("Failed to create admin order:", error);
        return { error: error.message || "Failed to create order" };
    }
}
