import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { NextResponse } from "next/server";
import { DashboardStats } from "@/domain/entities/views/admin/dashboardMetricsView";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
        return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    try {
        // Get base stats from RPC
        const { data: baseStats, error: rpcError } = await supabaseAdmin
            .schema('admin')
            .rpc('get_dashboard_stats', { p_start_date: startDate, p_end_date: endDate })
            .single();

        if (rpcError) {
            console.error("RPC Error:", rpcError);
            throw rpcError;
        }

        // === CUSTOMER COUNT ===
        // Use order_details view which has all the proper data
        // Get ALL orders with customer info
        const { data: allOrders, error: ordersError } = await supabaseAdmin
            .schema('admin')
            .from('order_details')
            .select('customer_email, phone_numbers, order_date');

        if (ordersError) {
            console.error("Orders error:", ordersError);
            throw ordersError;
        }

        // Count unique customers by email OR first phone number
        const uniqueCustomers = new Set<string>();

        (allOrders || []).forEach(order => {
            // Use email if available, otherwise use first phone
            const identifier = order.customer_email?.trim().toLowerCase()
                || (order.phone_numbers && order.phone_numbers[0]?.trim());

            if (identifier) {
                uniqueCustomers.add(identifier);
            }
        });

        const totalCustomers = uniqueCustomers.size;

        // === CUSTOMERS IN PERIOD ===
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Track unique customers per period by their first order date
        const customerFirstOrderDate = new Map<string, Date>();

        (allOrders || []).forEach(order => {
            const identifier = order.customer_email?.trim().toLowerCase()
                || (order.phone_numbers && order.phone_numbers[0]?.trim());

            if (identifier) {
                const orderDate = new Date(order.order_date);
                const existing = customerFirstOrderDate.get(identifier);

                if (!existing || orderDate < existing) {
                    customerFirstOrderDate.set(identifier, orderDate);
                }
            }
        });

        // Count new customers in current period (first order in this period)
        let periodCustomers = 0;
        customerFirstOrderDate.forEach((firstOrderDate) => {
            if (firstOrderDate >= start && firstOrderDate <= end) {
                periodCustomers++;
            }
        });

        // Count customers in previous period
        const periodLength = end.getTime() - start.getTime();
        const prevStart = new Date(start.getTime() - periodLength);
        const prevEnd = new Date(start.getTime() - 1);

        let prevPeriodCustomers = 0;
        customerFirstOrderDate.forEach((firstOrderDate) => {
            if (firstOrderDate >= prevStart && firstOrderDate <= prevEnd) {
                prevPeriodCustomers++;
            }
        });

        // Calculate change
        let customersChange = "0";
        if (prevPeriodCustomers > 0) {
            const change = periodCustomers - prevPeriodCustomers;
            customersChange = (change >= 0 ? "+" : "") + String(change);
        } else if (periodCustomers > 0) {
            customersChange = "+" + String(periodCustomers);
        }

        // === CONVERSION RATE ===
        // All customers in this view have placed orders, so conversion = 100%
        // But if we have registered customers who haven't ordered, we need to factor that in
        // For now, since we're counting people who ordered, conversion rate = 100%
        // A more meaningful metric would be: returning customers / total customers

        // Calculate repeat customer rate instead
        const customersWithMultipleOrders = new Map<string, number>();
        (allOrders || []).forEach(order => {
            const identifier = order.customer_email?.trim().toLowerCase()
                || (order.phone_numbers && order.phone_numbers[0]?.trim());

            if (identifier) {
                customersWithMultipleOrders.set(identifier, (customersWithMultipleOrders.get(identifier) || 0) + 1);
            }
        });

        let repeatCustomers = 0;
        customersWithMultipleOrders.forEach((orderCount) => {
            if (orderCount > 1) repeatCustomers++;
        });

        const conversionRate = totalCustomers > 0
            ? ((repeatCustomers / totalCustomers) * 100).toFixed(1)
            : "0";

        // === VISITOR-BASED CONVERSION RATE (from Google Analytics) ===
        let visitors = 0;
        let visitorConversionRate = "0";

        try {
            // Fetch visitors from GA4 API
            const gaResponse = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/analytics/visitors?startDate=${startDate}&endDate=${endDate}`
            );

            if (gaResponse.ok) {
                const gaData = await gaResponse.json();
                visitors = gaData.visitors || 0;

                // Calculate Visitor-based Conversion Rate = (Orders in period / Visitors) * 100
                const periodOrders = (baseStats as any)?.current_period_orders || 0;
                if (visitors > 0) {
                    visitorConversionRate = ((periodOrders / visitors) * 100).toFixed(1);
                }
            }
        } catch (gaError) {
            console.log("[Dashboard Stats] GA4 fetch skipped:", gaError);
        }

        // Merge with RPC results
        const stats: DashboardStats = {
            ...baseStats as DashboardStats,
            total_customers: totalCustomers,
            current_period_customers: periodCustomers,
            customers_change: customersChange,
            current_period_conversion_rate: conversionRate,
            visitors: visitors,
            visitor_conversion_rate: visitorConversionRate
        };

        return NextResponse.json(stats);

    } catch (err: any) {
        console.error("[Dashboard Stats] Error:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}
