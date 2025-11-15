'use server'

import {revalidatePath} from 'next/cache'
import {OrderDetailsView} from '@/domain/entities/views/admin/orderDetailsView'
import {Orders} from '@/domain/use-case/admin/orders'

export async function updateOrder(data: Partial<OrderDetailsView>) {
    if (!data || typeof data.order_id === 'undefined' || typeof data.order_status === 'undefined') {
        return {error: 'Invalid payload'}
    }

    try {
        await new Orders().update(data)
        // revalidate relevant admin pages
        revalidatePath('/admin', 'layout')
        return {ok: true}
    } catch (err: any) {
        console.error('[useUpdateOrderActions] updateOrder error:', err)
        return {error: err?.message ?? 'Internal error'}
    }
}

