import { supabaseAdmin } from "@/data/datasources/supabase/admin";

export interface TopSellingProduct {
    product_id: number;
    product_name: string;
    variant_id: number | null;
    variant_name: string | null;
    total_quantity: number;
    total_revenue: number;
    order_count: number;
}

export interface UserSalesBreakdown {
    user_id: number;
    user_name: string;
    user_role: string;
    total_orders: number;
    total_revenue: number;
    top_products: TopSellingProduct[];
}

export class GetUserSalesAnalytics {

    /**
     * Get top-selling products for a specific user (by their created orders)
     */
    async getTopSellingProductsForUser(
        creatorCustomerId: number,
        startDate: string,
        endDate: string,
        limit: number = 10
    ): Promise<TopSellingProduct[]> {
        try {
            // 1. Get orders created by this user in the date range
            const { data: orders, error: ordersError } = await supabaseAdmin.schema('store')
                .from('orders')
                .select('id')
                .eq('created_by_customer_id', creatorCustomerId)
                .gte('created_at', startDate)
                .lte('created_at', endDate + 'T23:59:59')
                .neq('status', 'cancelled');

            if (ordersError) throw ordersError;
            if (!orders || orders.length === 0) return [];

            const orderIds = orders.map(o => o.id);

            // 2. Get order items for those orders
            const { data: items, error: itemsError } = await supabaseAdmin.schema('store')
                .from('order_items')
                .select('product_id, variant_id, quantity, unit_price')
                .in('order_id', orderIds);

            if (itemsError) throw itemsError;
            if (!items || items.length === 0) return [];

            // 3. Aggregate by product/variant
            return await this.aggregateProducts(items, limit);
        } catch (error) {
            console.error("[GetUserSalesAnalytics] getTopSellingProductsForUser error:", error);
            throw error;
        }
    }

    /**
     * Get global top-selling products across all users (admin view)
     */
    async getGlobalTopSellingProducts(
        startDate: string,
        endDate: string,
        limit: number = 10
    ): Promise<TopSellingProduct[]> {
        try {
            const { data: orders, error: ordersError } = await supabaseAdmin.schema('store')
                .from('orders')
                .select('id')
                .gte('created_at', startDate)
                .lte('created_at', endDate + 'T23:59:59')
                .neq('status', 'cancelled');

            if (ordersError) throw ordersError;
            if (!orders || orders.length === 0) return [];

            const orderIds = orders.map(o => o.id);

            const { data: items, error: itemsError } = await supabaseAdmin.schema('store')
                .from('order_items')
                .select('product_id, variant_id, quantity, unit_price')
                .in('order_id', orderIds);

            if (itemsError) throw itemsError;
            if (!items || items.length === 0) return [];

            return await this.aggregateProducts(items, limit);
        } catch (error) {
            console.error("[GetUserSalesAnalytics] getGlobalTopSellingProducts error:", error);
            throw error;
        }
    }

    /**
     * Get top-selling products grouped by user (admin view: per-user breakdown)
     */
    async getTopSellingProductsPerUser(
        startDate: string,
        endDate: string,
        productsPerUser: number = 5
    ): Promise<UserSalesBreakdown[]> {
        try {
            // 1. Get all orders with creator info
            const { data: orders, error: ordersError } = await supabaseAdmin.schema('store')
                .from('orders')
                .select('id, created_by_customer_id, grand_total')
                .gte('created_at', startDate)
                .lte('created_at', endDate + 'T23:59:59')
                .neq('status', 'cancelled')
                .not('created_by_customer_id', 'is', null);

            if (ordersError) throw ordersError;
            if (!orders || orders.length === 0) return [];

            // 2. Get all order items
            const orderIds = orders.map(o => o.id);
            const { data: items, error: itemsError } = await supabaseAdmin.schema('store')
                .from('order_items')
                .select('order_id, product_id, variant_id, quantity, unit_price')
                .in('order_id', orderIds);

            if (itemsError) throw itemsError;

            // 3. Group orders by creator
            const ordersByCreator: Record<number, { orderIds: number[]; totalRevenue: number; orderCount: number }> = {};
            for (const order of orders) {
                const cId = order.created_by_customer_id!;
                if (!ordersByCreator[cId]) {
                    ordersByCreator[cId] = { orderIds: [], totalRevenue: 0, orderCount: 0 };
                }
                ordersByCreator[cId].orderIds.push(order.id);
                ordersByCreator[cId].totalRevenue += order.grand_total || 0;
                ordersByCreator[cId].orderCount++;
            }

            // 4. Get creator names and roles
            const creatorIds = Object.keys(ordersByCreator).map(Number);
            const { data: creators } = await supabaseAdmin.schema('store')
                .from('customers')
                .select('id, name')
                .in('id', creatorIds);
            const nameMap: Record<number, string> = {};
            (creators || []).forEach(c => { nameMap[c.id] = c.name || 'Unknown'; });

            const { data: members } = await supabaseAdmin.schema('store')
                .from('members')
                .select('user_id, role')
                .in('user_id', creatorIds);
            const roleMap: Record<number, string> = {};
            (members || []).forEach(m => { roleMap[m.user_id] = m.role || 'staff'; });

            // 5. Build per-user breakdowns
            const itemsByOrder: Record<number, typeof items> = {};
            for (const item of (items || [])) {
                if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
                itemsByOrder[item.order_id].push(item);
            }

            const result: UserSalesBreakdown[] = [];

            for (const [userIdStr, data] of Object.entries(ordersByCreator)) {
                const userId = Number(userIdStr);
                const userItems = data.orderIds.flatMap(oid => itemsByOrder[oid] || []);
                const topProducts = await this.aggregateProducts(userItems, productsPerUser);

                result.push({
                    user_id: userId,
                    user_name: nameMap[userId] || 'Unknown',
                    user_role: roleMap[userId] || 'staff',
                    total_orders: data.orderCount,
                    total_revenue: data.totalRevenue,
                    top_products: topProducts,
                });
            }

            // Sort by total revenue descending
            result.sort((a, b) => b.total_revenue - a.total_revenue);
            return result;
        } catch (error) {
            console.error("[GetUserSalesAnalytics] getTopSellingProductsPerUser error:", error);
            throw error;
        }
    }

    /**
     * Aggregate order items into top-selling products
     */
    private async aggregateProducts(
        items: { product_id: number; variant_id: number | null; quantity: number; unit_price: number }[],
        limit: number
    ): Promise<TopSellingProduct[]> {
        // Aggregate by product+variant
        const agg: Record<string, { product_id: number; variant_id: number | null; totalQty: number; totalRev: number; orderIds: Set<number> }> = {};

        for (const item of items) {
            const key = `${item.product_id}-${item.variant_id || 0}`;
            if (!agg[key]) {
                agg[key] = {
                    product_id: item.product_id,
                    variant_id: item.variant_id || null,
                    totalQty: 0,
                    totalRev: 0,
                    orderIds: new Set()
                };
            }
            agg[key].totalQty += item.quantity;
            agg[key].totalRev += item.quantity * item.unit_price;
        }

        // Fetch product names
        const productIds = [...new Set(Object.values(agg).map(a => a.product_id))];
        let productNameMap: Record<number, string> = {};
        if (productIds.length > 0) {
            const { data: products } = await supabaseAdmin.schema('store')
                .from('products')
                .select('id, name_en')
                .in('id', productIds);
            productNameMap = (products || []).reduce((acc, p) => { acc[p.id] = p.name_en || 'Unknown'; return acc; }, {} as Record<number, string>);
        }

        // Fetch variant names
        const variantIds = [...new Set(Object.values(agg).map(a => a.variant_id).filter(Boolean))] as number[];
        let variantNameMap: Record<number, string> = {};
        if (variantIds.length > 0) {
            const { data: variants } = await supabaseAdmin.schema('store')
                .from('product_variants')
                .select('id, name_en')
                .in('id', variantIds);
            variantNameMap = (variants || []).reduce((acc, v) => { acc[v.id] = v.name_en || ''; return acc; }, {} as Record<number, string>);
        }

        // Build result
        const results: TopSellingProduct[] = Object.values(agg).map(a => ({
            product_id: a.product_id,
            product_name: productNameMap[a.product_id] || `Deleted Product #${a.product_id}`,
            variant_id: a.variant_id,
            variant_name: a.variant_id ? (variantNameMap[a.variant_id] || null) : null,
            total_quantity: a.totalQty,
            total_revenue: a.totalRev,
            order_count: a.orderIds.size,
        }));

        // Sort by quantity descending and limit
        results.sort((a, b) => b.total_quantity - a.total_quantity);
        return results.slice(0, limit);
    }
}
