'use server'

import {revalidatePath} from 'next/cache'
import {Order} from "@/domain/entities/database/order";
import {CartItem} from "@/domain/entities/views/shop/productView";
import {OrderItem} from "@/domain/entities/database/orderItem";
import {CreateOrder} from "@/domain/use-case/shop/createOrder";
import {cookies} from "next/headers";


export async function createOrder(data: Partial<Order>, items: CartItem[]) {
    if (!data.customer_id && (!data.guest_name || !data.guest_email || !data.guest_phone || !data.guest_address)) {
        return {error: 'Missing required guest information'};
    }

    const purchasedItems: Partial<OrderItem>[] = items.map(item => ({
        product_id: item.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.price,
        discount: item.discount || 0,
    }));
    const sentOrder: Partial<Order> = {
        ...data,
        items: purchasedItems,
    };
    let cookie = await cookies();

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
    return {order_id: createdOrder.order_id}

}

