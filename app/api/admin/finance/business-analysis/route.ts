import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { NextResponse } from "next/server";

// GET: Calculate business analysis metrics for a date range
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!startDate || !endDate) {
            return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
        }

        // 1. Calculate Revenue from delivered orders
        const { data: ordersData, error: ordersError } = await supabaseAdmin
            .schema('store')
            .from('orders')
            .select('id, grand_total, created_at')
            .gte('created_at', startDate)
            .lte('created_at', endDate + 'T23:59:59')
            .in('status', ['delivered', 'completed']);

        if (ordersError) {
            console.error("[Business Analysis] Orders error:", ordersError);
            return NextResponse.json({ error: ordersError.message }, { status: 500 });
        }

        const revenue = (ordersData || []).reduce((sum, order) => sum + (order.grand_total || 0), 0);
        const orderIds = (ordersData || []).map(o => o.id);

        // 2. Calculate COGS (Cost of Goods Sold) with detailed breakdown
        let cogs = 0;
        const cogsBreakdown: {
            product_id: number;
            variant_id: number | null;
            product_name: string;
            quantity: number;
            materials_cost: number;
        }[] = [];

        if (orderIds.length > 0) {
            // Get order items for these orders with product info
            const { data: orderItems, error: itemsError } = await supabaseAdmin
                .schema('store')
                .from('order_items')
                .select('product_id, variant_id, quantity, products(name_en), product_variants(name_en)')
                .in('order_id', orderIds);

            if (itemsError) {
                console.error("[Business Analysis] Order items error:", itemsError);
            } else if (orderItems && orderItems.length > 0) {
                // Get materials for products
                const productIds = [...new Set(orderItems.map(item => item.product_id))];
                const variantIds = [...new Set(orderItems.filter(item => item.variant_id).map(item => item.variant_id))];

                // Get product materials with material prices
                const { data: productMaterials, error: pmError } = await supabaseAdmin
                    .schema('store')
                    .from('product_materials')
                    .select(`
                        product_id,
                        variant_id,
                        grams_used,
                        material_id
                    `)
                    .or(`product_id.in.(${productIds.join(',')}),variant_id.in.(${variantIds.length > 0 ? variantIds.join(',') : '0'})`);

                if (pmError) {
                    console.error("[Business Analysis] Product materials error:", pmError);
                } else if (productMaterials && productMaterials.length > 0) {
                    // Get material prices and names
                    const materialIds = [...new Set(productMaterials.map(pm => pm.material_id))];

                    const { data: materials, error: matError } = await supabaseAdmin
                        .schema('admin')
                        .from('materials')
                        .select('id, name, price_per_gram')
                        .in('id', materialIds);

                    if (!matError && materials) {
                        const materialMap = new Map(materials.map(m => [m.id, { name: m.name, price: m.price_per_gram }]));

                        // Calculate cost for each order item
                        for (const item of orderItems) {
                            // Find materials for this product/variant
                            const itemMaterials = productMaterials.filter(pm =>
                                (item.variant_id && pm.variant_id === item.variant_id) ||
                                (!item.variant_id && pm.product_id === item.product_id && !pm.variant_id)
                            );

                            let itemCost = 0;
                            for (const pm of itemMaterials) {
                                const materialInfo = materialMap.get(pm.material_id);
                                const pricePerGram = materialInfo?.price || 0;
                                itemCost += (pm.grams_used || 0) * pricePerGram;
                            }

                            const totalCost = itemCost * item.quantity;
                            cogs += totalCost;

                            // Get product name
                            const productName = item.variant_id
                                ? (item.product_variants as any)?.name_en || `Variant #${item.variant_id}`
                                : (item.products as any)?.name_en || `Product #${item.product_id}`;

                            // Check if already exists in breakdown
                            const existingIdx = cogsBreakdown.findIndex(c =>
                                c.product_id === item.product_id && c.variant_id === item.variant_id
                            );

                            if (existingIdx >= 0) {
                                cogsBreakdown[existingIdx].quantity += item.quantity;
                                cogsBreakdown[existingIdx].materials_cost += totalCost;
                            } else {
                                cogsBreakdown.push({
                                    product_id: item.product_id,
                                    variant_id: item.variant_id,
                                    product_name: productName,
                                    quantity: item.quantity,
                                    materials_cost: Math.round(totalCost * 100) / 100
                                });
                            }
                        }
                    }
                }
            }
        }

        // 3. Calculate Operating Expenses from Cashflow (expenses)
        const { data: expensesData, error: expensesError } = await supabaseAdmin
            .schema('admin')
            .from('cashflow_transactions')
            .select('id, date, reference, description, amount, cashflow_categories(name, exclude_from_opex)')
            .eq('type', 'expense')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false });

        if (expensesError) {
            console.error("[Business Analysis] Expenses error:", expensesError);
        }

        const allExpenses = expensesData || [];
        // Operating Expenses = Expenses NOT excluded
        const operatingExpenses = allExpenses
            .filter(e => !(e.cashflow_categories as any)?.exclude_from_opex)
            .reduce((sum, exp) => sum + (exp.amount || 0), 0);

        // 4. Calculate Cash Inflow from Cashflow (income)
        const { data: incomeData, error: incomeError } = await supabaseAdmin
            .schema('admin')
            .from('cashflow_transactions')
            .select('id, date, reference, description, amount, cashflow_categories(name)')
            .eq('type', 'income')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false });

        if (incomeError) {
            console.error("[Business Analysis] Income error:", incomeError);
        }

        const cashInflow = (incomeData || []).reduce((sum, inc) => sum + (inc.amount || 0), 0);

        // Cash Outflow includes ALL expenses (even excluded ones like Owner Withdrawal)
        const cashOutflow = allExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

        // Calculate derived metrics
        const grossProfit = revenue - cogs;
        const netProfit = grossProfit - operatingExpenses;
        const cashFlow = cashInflow - cashOutflow;

        const result = {
            revenue: Math.round(revenue * 100) / 100,
            cogs: Math.round(cogs * 100) / 100,
            grossProfit: Math.round(grossProfit * 100) / 100,
            operatingExpenses: Math.round(operatingExpenses * 100) / 100,
            netProfit: Math.round(netProfit * 100) / 100,
            cashInflow: Math.round(cashInflow * 100) / 100,
            cashOutflow: Math.round(cashOutflow * 100) / 100,
            cashFlow: Math.round(cashFlow * 100) / 100,
            ordersCount: orderIds.length,
            period: { startDate, endDate },
            // Detailed breakdowns
            details: {
                orders: ordersData || [],
                cogs: cogsBreakdown,
                expenses: (expensesData || []).map(e => ({
                    ...e,
                    category: (e.cashflow_categories as any)?.name || 'Uncategorized',
                    exclude_from_opex: (e.cashflow_categories as any)?.exclude_from_opex || false
                })),
                income: (incomeData || []).map(i => ({
                    ...i,
                    category: (i.cashflow_categories as any)?.name || 'Uncategorized'
                }))
            }
        };

        return NextResponse.json(result);
    } catch (err: any) {
        console.error("[Business Analysis] Exception:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
