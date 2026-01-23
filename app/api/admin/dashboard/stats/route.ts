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
        // Get stats from RPC
        const { data: baseStats, error: rpcError } = await supabaseAdmin
            .schema('admin')
            .rpc('get_dashboard_stats', { p_start_date: startDate, p_end_date: endDate })
            .single();

        if (rpcError) {
            console.error("RPC Error:", rpcError);
            throw rpcError;
        }

        // Custom Customer Calculation using order_details view (which has customer_email)
        // Fetch all registered customers
        const { data: customersData, error: custError } = await supabaseAdmin
            .schema('store')
            .from('customers')
            .select('email, created_at');

        // Use order_details view instead of orders table
        const { data: ordersData, error: ordersError } = await supabaseAdmin
            .schema('admin')
            .from('order_details')
            .select('customer_email, order_date')
            .order('order_date', { ascending: true });

        if (custError) throw custError;
        if (ordersError) throw ordersError;

        const customers = customersData || [];
        const orders = ordersData || [];

        // Map of First Seen Date for every unique email
        const emailFirstSeen = new Map<string, string>();

        // Populate with registration dates
        customers.forEach(c => {
            if (c.email) {
                const email = c.email.toLowerCase().trim();
                emailFirstSeen.set(email, c.created_at);
            }
        });

        // Populate/Update with order dates from order_details view
        orders.forEach(o => {
            if (o.customer_email) {
                const email = o.customer_email.toLowerCase().trim();
                const currentFirstSeen = emailFirstSeen.get(email);

                if (!currentFirstSeen || new Date(o.order_date) < new Date(currentFirstSeen)) {
                    emailFirstSeen.set(email, o.order_date);
                }
            }
        });

        const totalUniqueCustomers = emailFirstSeen.size;

        // Count new customers in period
        let newCustomersCount = 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        emailFirstSeen.forEach((dateStr) => {
            const seenDate = new Date(dateStr);
            if (seenDate >= start && seenDate <= end) {
                newCustomersCount++;
            }
        });

        // Calculate Change for Customers
        let prevCustomersCount = 0;
        const periodLength = end.getTime() - start.getTime();
        const prevStart = new Date(start.getTime() - periodLength);
        const prevEnd = new Date(start.getTime());

        emailFirstSeen.forEach((dateStr) => {
            const seenDate = new Date(dateStr);
            if (seenDate >= prevStart && seenDate < prevEnd) {
                prevCustomersCount++;
            }
        });

        let customersChange = "0";
        if (prevCustomersCount > 0) {
            const change = ((newCustomersCount - prevCustomersCount) / prevCustomersCount) * 100;
            customersChange = change.toFixed(1);
        } else {
            customersChange = newCustomersCount > 0 ? "100" : "0";
        }

        // Merge results
        const stats: DashboardStats = {
            ...baseStats as DashboardStats,
            total_customers: totalUniqueCustomers,
            current_period_customers: newCustomersCount,
            customers_change: customersChange as string
        };

        return NextResponse.json(stats);

    } catch (err: any) {
        console.error("[Dashboard Stats] Error:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}
