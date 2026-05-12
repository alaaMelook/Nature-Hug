import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { NextResponse } from "next/server";
import { phoneMatchVariants } from "@/lib/utils/phoneUtils";

// GET: Fetch customer order history by phone number
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone')?.trim();

        if (!phone || phone.length < 8) {
            return NextResponse.json({ success: false, error: "Phone number too short" }, { status: 400 });
        }

        const variants = phoneMatchVariants(phone);

        // 1. Find customer by phone
        const phoneFilters = variants.map(v => `phone.ilike.%${v}%`);
        const phone2Filters = variants.map(v => `phone2.ilike.%${v}%`);

        const { data: customers } = await supabaseAdmin.schema('store')
            .from('customers')
            .select('id, name, phone, phone2')
            .or([...phoneFilters, ...phone2Filters].join(','))
            .limit(5);

        if (!customers || customers.length === 0) {
            return NextResponse.json({
                success: true,
                customer: { name: null, phone, totalOrders: 0, totalSpent: 0, lastOrderDate: null, bazaarOrders: 0, onlineOrders: 0, topProducts: [] },
                orders: [],
            });
        }

        // Collect all matching customer IDs
        const customerIds = customers.map(c => c.id);
        const customerName = customers[0].name;

        // 2. Find all orders by these customer IDs
        const { data: orders, error: ordersError } = await supabaseAdmin.schema('store')
            .from('orders')
            .select('id, status, grand_total, subtotal, discount_total, payment_method, created_at, customer_id, bazaar_id, note')
            .in('customer_id', customerIds)
            .order('created_at', { ascending: false })
            .limit(50);

        if (ordersError) {
            console.error("[CustomerHistory] orders error:", ordersError);
            return NextResponse.json({ success: false, error: ordersError.message }, { status: 500 });
        }

        if (!orders || orders.length === 0) {
            return NextResponse.json({
                success: true,
                customer: { name: customerName, phone, totalOrders: 0, totalSpent: 0, lastOrderDate: null, bazaarOrders: 0, onlineOrders: 0, topProducts: [] },
                orders: [],
            });
        }

        // 3. Get order items
        const orderIds = orders.map(o => o.id);
        const { data: items } = await supabaseAdmin.schema('store')
            .from('order_items')
            .select('order_id, product_id, variant_id, quantity, unit_price')
            .in('order_id', orderIds);

        // 4. Get product names
        const productIds = [...new Set((items || []).map(i => i.product_id).filter(Boolean))];
        let productNameMap: Record<number, string> = {};
        if (productIds.length > 0) {
            const { data: products } = await supabaseAdmin.schema('store')
                .from('products')
                .select('id, name')
                .in('id', productIds);
            productNameMap = (products || []).reduce((acc: Record<number, string>, p: any) => {
                acc[p.id] = p.name;
                return acc;
            }, {});
        }

        // Get variant names
        const variantIds = [...new Set((items || []).map(i => i.variant_id).filter(Boolean))];
        let variantNameMap: Record<number, string> = {};
        if (variantIds.length > 0) {
            const { data: vdata } = await supabaseAdmin.schema('store')
                .from('product_variants')
                .select('id, name_en, product_id')
                .in('id', variantIds);
            variantNameMap = (vdata || []).reduce((acc: Record<number, string>, v: any) => {
                acc[v.id] = `${productNameMap[v.product_id] || ''} - ${v.name_en}`.replace(/^ - /, '');
                return acc;
            }, {});
        }

        // 5. Get bazaar names
        const bazaarIds = [...new Set(orders.map(o => o.bazaar_id).filter(Boolean))];
        let bazaarNameMap: Record<number, string> = {};
        if (bazaarIds.length > 0) {
            const { data: bazaars } = await supabaseAdmin.schema('store')
                .from('bazaars')
                .select('id, name')
                .in('id', bazaarIds);
            bazaarNameMap = (bazaars || []).reduce((acc: Record<number, string>, b: any) => {
                acc[b.id] = b.name;
                return acc;
            }, {});
        }

        // 6. Build items by order
        const itemsByOrder: Record<number, { name: string; quantity: number; unitPrice: number }[]> = {};
        for (const item of (items || [])) {
            if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
            const name = item.variant_id
                ? (variantNameMap[item.variant_id] || productNameMap[item.product_id] || `Product #${item.product_id}`)
                : (productNameMap[item.product_id] || `Product #${item.product_id}`);
            itemsByOrder[item.order_id].push({ name, quantity: item.quantity, unitPrice: item.unit_price });
        }

        // 7. Build response
        const responseOrders = orders.map(order => ({
            orderId: order.id,
            date: order.created_at,
            status: order.status,
            grandTotal: order.grand_total,
            paymentMethod: order.payment_method,
            type: order.bazaar_id ? 'bazaar' : 'online',
            bazaarName: order.bazaar_id ? (bazaarNameMap[order.bazaar_id] || null) : null,
            items: itemsByOrder[order.id] || [],
        }));

        // 8. Summary
        const validOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded');
        const totalSpent = validOrders.reduce((acc, o) => acc + (o.grand_total || 0), 0);
        const bazaarOrders = orders.filter(o => o.bazaar_id).length;
        const onlineOrders = orders.length - bazaarOrders;

        // Top products
        const productFreq: Record<string, number> = {};
        for (const item of (items || [])) {
            const name = item.variant_id
                ? (variantNameMap[item.variant_id] || productNameMap[item.product_id] || '')
                : (productNameMap[item.product_id] || '');
            if (name) productFreq[name] = (productFreq[name] || 0) + item.quantity;
        }
        const topProducts = Object.entries(productFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, qty]) => ({ name, quantity: qty }));

        return NextResponse.json({
            success: true,
            customer: {
                name: customerName,
                phone,
                totalOrders: orders.length,
                totalSpent,
                lastOrderDate: orders[0]?.created_at || null,
                bazaarOrders,
                onlineOrders,
                topProducts,
            },
            orders: responseOrders,
        });
    } catch (err: any) {
        console.error("[CustomerHistory] Error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

