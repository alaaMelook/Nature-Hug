import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { NextResponse } from "next/server";

// GET: Export bazaar customers as CSV
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const bazaarId = parseInt(id);

        // 1. Get all orders for this bazaar
        const { data: orders, error } = await supabaseAdmin.schema('store')
            .from('orders')
            .select('id, customer_id, grand_total, status, created_at, payment_method')
            .eq('bazaar_id', bazaarId)
            .not('status', 'in', '(cancelled,refunded,returned)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        if (!orders || orders.length === 0) {
            return new Response('No customers found', { status: 404 });
        }

        // 2. Get customer details
        const customerIds = [...new Set(orders.map(o => o.customer_id).filter(Boolean))];
        let customerMap: Record<number, { name: string; phone: string; phone2: string; email: string }> = {};

        if (customerIds.length > 0) {
            const { data: customers } = await supabaseAdmin.schema('store')
                .from('customers')
                .select('id, name, phone, phone2, email')
                .in('id', customerIds);

            for (const c of (customers || [])) {
                customerMap[c.id] = {
                    name: c.name || '',
                    phone: c.phone || '',
                    phone2: c.phone2 || '',
                    email: c.email || '',
                };
            }
        }

        // 3. Get order items
        const orderIds = orders.map(o => o.id);
        const { data: items } = await supabaseAdmin.schema('store')
            .from('order_items')
            .select('order_id, product_id, variant_id, quantity, unit_price')
            .in('order_id', orderIds);

        // Get product names
        const productIds = [...new Set((items || []).map(i => i.product_id).filter(Boolean))];
        let productNameMap: Record<number, string> = {};
        if (productIds.length > 0) {
            const { data: products } = await supabaseAdmin.schema('store')
                .from('products')
                .select('id, name')
                .in('id', productIds);
            for (const p of (products || [])) productNameMap[p.id] = p.name;
        }

        // Get variant names
        const variantIds = [...new Set((items || []).map(i => i.variant_id).filter(Boolean))];
        let variantNameMap: Record<number, string> = {};
        if (variantIds.length > 0) {
            const { data: vdata } = await supabaseAdmin.schema('store')
                .from('product_variants')
                .select('id, name_en, product_id')
                .in('id', variantIds);
            for (const v of (vdata || [])) {
                variantNameMap[v.id] = `${productNameMap[v.product_id] || ''} - ${v.name_en}`.replace(/^ - /, '');
            }
        }

        // 4. Aggregate per customer
        const custAgg: Record<number, {
            name: string; phone: string; phone2: string; email: string;
            orderCount: number; totalSpent: number; firstOrder: string; lastOrder: string;
            products: Record<string, number>;
        }> = {};

        for (const order of orders) {
            const cid = order.customer_id;
            if (!cid) continue;
            const cust = customerMap[cid];
            if (!cust) continue;

            if (!custAgg[cid]) {
                custAgg[cid] = {
                    ...cust,
                    orderCount: 0,
                    totalSpent: 0,
                    firstOrder: order.created_at,
                    lastOrder: order.created_at,
                    products: {},
                };
            }
            custAgg[cid].orderCount++;
            custAgg[cid].totalSpent += order.grand_total || 0;
            // Track first/last
            if (order.created_at < custAgg[cid].firstOrder) custAgg[cid].firstOrder = order.created_at;
            if (order.created_at > custAgg[cid].lastOrder) custAgg[cid].lastOrder = order.created_at;

            // Aggregate products
            const orderItems = (items || []).filter(i => i.order_id === order.id);
            for (const item of orderItems) {
                const pName = item.variant_id
                    ? (variantNameMap[item.variant_id] || productNameMap[item.product_id] || '')
                    : (productNameMap[item.product_id] || '');
                if (pName) custAgg[cid].products[pName] = (custAgg[cid].products[pName] || 0) + item.quantity;
            }
        }

        // 5. Get bazaar name for filename
        const { data: bazaar } = await supabaseAdmin.schema('store')
            .from('bazaars')
            .select('name')
            .eq('id', bazaarId)
            .single();

        // 6. Build CSV
        const BOM = '\uFEFF'; // UTF-8 BOM for Arabic support in Excel
        const headers = ['Customer Name', 'Phone', 'Phone 2', 'Email', 'Orders Count', 'Total Spent (EGP)', 'First Order', 'Last Order', 'Products Purchased'];
        const rows = Object.values(custAgg)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .map(c => {
                const productsStr = Object.entries(c.products).map(([name, qty]) => `${name} (x${qty})`).join(' | ');
                // Use ="value" trick to force Excel to treat phone numbers as text
                const fmtPhone = (p: string) => p ? `="${p}"` : '""';
                return [
                    `"${c.name}"`,
                    fmtPhone(c.phone),
                    fmtPhone(c.phone2),
                    `"${c.email}"`,
                    c.orderCount,
                    c.totalSpent,
                    `"${new Date(c.firstOrder).toLocaleDateString('en-US')}"`,
                    `"${new Date(c.lastOrder).toLocaleDateString('en-US')}"`,
                    `"${productsStr}"`,
                ].join(',');
            });

        const csv = BOM + headers.join(',') + '\n' + rows.join('\n');
        const filename = `${(bazaar?.name || 'bazaar').replace(/[^a-zA-Z0-9\u0600-\u06FF ]/g, '_')}_customers.csv`;

        return new Response(csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (err: any) {
        console.error("[ExportCustomers] Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
