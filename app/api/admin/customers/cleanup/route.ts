import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { NextResponse } from "next/server";

// POST: Clean up empty customer rows (no name, no phone, no orders)
export async function POST() {
    try {
        // 1. Get all customers with NULL name and NULL phone
        const { data: emptyCustomers, error: fetchError } = await supabaseAdmin
            .schema('store')
            .from('customers')
            .select('id, auth_user_id')
            .is('name', null)
            .is('phone', null)
            .limit(10000);

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!emptyCustomers || emptyCustomers.length === 0) {
            return NextResponse.json({ cleaned: 0, message: "No empty customers found" });
        }

        const emptyIds = emptyCustomers.map(c => c.id);

        // 2. Find which of these have orders (keep those)
        const { data: withOrders } = await supabaseAdmin
            .schema('store')
            .from('orders')
            .select('customer_id')
            .in('customer_id', emptyIds.slice(0, 500)); // batch

        const { data: withOrders2 } = emptyIds.length > 500
            ? await supabaseAdmin.schema('store').from('orders').select('customer_id').in('customer_id', emptyIds.slice(500))
            : { data: [] };

        const orderCustomerIds = new Set([
            ...(withOrders || []).map((o: any) => o.customer_id),
            ...(withOrders2 || []).map((o: any) => o.customer_id),
        ]);

        // 3. Find which are members (keep those)
        const { data: memberRows } = await supabaseAdmin
            .schema('store')
            .from('members')
            .select('user_id');

        const memberIds = new Set((memberRows || []).map((m: any) => m.user_id));

        // 4. Filter to customers safe to delete (no orders, not members)
        const toDelete = emptyIds.filter(id =>
            !orderCustomerIds.has(id) && !memberIds.has(id)
        );

        if (toDelete.length === 0) {
            return NextResponse.json({
                cleaned: 0,
                total_empty: emptyIds.length,
                kept_with_orders: orderCustomerIds.size,
                message: "All empty customers have orders or are members"
            });
        }

        // 5. Delete addresses first (FK constraint)
        await supabaseAdmin
            .schema('store')
            .from('customer_addresses')
            .delete()
            .in('customer_id', toDelete.slice(0, 500));
        if (toDelete.length > 500) {
            await supabaseAdmin.schema('store').from('customer_addresses').delete().in('customer_id', toDelete.slice(500));
        }

        // 6. Delete empty customers in batches
        let deleted = 0;
        for (let i = 0; i < toDelete.length; i += 200) {
            const batch = toDelete.slice(i, i + 200);
            const { error: deleteError } = await supabaseAdmin
                .schema('store')
                .from('customers')
                .delete()
                .in('id', batch);

            if (deleteError) {
                console.error(`[Cleanup] Batch delete error at ${i}:`, deleteError);
            } else {
                deleted += batch.length;
            }
        }

        return NextResponse.json({
            cleaned: deleted,
            total_empty: emptyIds.length,
            kept_with_orders: orderCustomerIds.size,
            kept_as_members: [...memberIds].filter(id => emptyIds.includes(id)).length,
            message: `Cleaned ${deleted} empty customer rows`
        });

    } catch (err: any) {
        console.error("[Cleanup] Exception:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// GET: Preview how many would be cleaned
export async function GET() {
    try {
        const { data: emptyCustomers, error } = await supabaseAdmin
            .schema('store')
            .from('customers')
            .select('id', { count: 'exact' })
            .is('name', null)
            .is('phone', null)
            .limit(10000);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            empty_count: emptyCustomers?.length || 0,
            message: "These customers have no name and no phone number"
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
