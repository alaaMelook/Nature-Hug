'use server'

import { revalidatePath } from 'next/cache'
import { Order } from "@/domain/entities/database/order";
import { CartItem } from "@/domain/entities/views/shop/productView";
import { OrderItem } from "@/domain/entities/database/orderItem";
import { CreateOrder } from "@/domain/use-case/store/createOrder";
import { cookies } from "next/headers";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";

export async function createOrder(data: Partial<Order>, isAdmin: boolean, items: CartItem[]) {
    if (!data.customer_id && (!data.guest_name || !data.guest_phone || !data.guest_address)) {
        return { error: 'Missing required guest information' };
    }
    const user = await new GetCurrentUser().getAnonymousSessionId();
    const purchasedItems: Partial<OrderItem>[] = items.map(item => ({
        product_id: item.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.price,
        discount: item.discount || 0,
    }));
    const sentOrder: Partial<Order> = {
        ...data,
        discount_total: data.discount_total,
        sessionId: isAdmin ? null : user,
        items: purchasedItems,
        promo_code_id: data.promo_code_id
    };
    let cookie = await cookies();
    console.log("[createOrder] user_id:", user);
    try {
        const createdOrder = await new CreateOrder().execute(sentOrder);
        cookie.set({
            name: 'fromCheckout',
            value: 'true',
            httpOnly: true,
            path: '/',
            maxAge: 30
        });
        cookie.set({
            name: 'customer',
            value: createdOrder.customer_id.toString(),
            httpOnly: true,
            path: '/',
            maxAge: 60 * 30
        });

        revalidatePath('/', 'layout');
        return { order_id: createdOrder.order_id }
    }
    catch (error) {
        console.error(error);
        return { error: 'Failed to create order' };
    }
}

