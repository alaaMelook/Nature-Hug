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
        // 1. Get base stats from RPC (reusing existing logic for revenue/products/orders)
        const { data: baseStats, error: rpcError } = await supabaseAdmin
            .schema('admin')
            .rpc('get_dashboard_stats', { p_start_date: startDate, p_end_date: endDate })
            .single();

        if (rpcError) {
            console.error("RPC Error:", rpcError);
            throw rpcError;
        }

        // 2. Custom Customer Calculation (Registered + Keys)
        // Fetch all registered customers
        const { data: customersData, error: custError } = await supabaseAdmin
            .schema('store')
            .from('customers')
            .select('email, created_at');

        // Fetch all orders (for guest emails) - USING guest_email instead of customer_email
        const { data: ordersData, error: ordersError } = await supabaseAdmin
            .schema('store')
            .from('orders')
            .select('guest_email, created_at')
            .order('created_at', { ascending: true });

        if (custError) throw custError;
        if (ordersError) throw ordersError;

        const customers = customersData || [];
        const orders = ordersData || [];

        // Map of First Seen Date for every unique email
        // Key: Email (lowercase), Value: First Seen Date (ISO string)
        const emailFirstSeen = new Map<string, string>();

        // 1. Populate with registration dates
        customers.forEach(c => {
            if (c.email) {
                const email = c.email.toLowerCase().trim();
                emailFirstSeen.set(email, c.created_at);
            }
        });

        // 2. Populate/Update with order dates (capture guests or earlier interactions)
        orders.forEach(o => {
            if (o.guest_email) {
                const email = o.guest_email.toLowerCase().trim();
                const currentFirstSeen = emailFirstSeen.get(email);

                // If not seen yet, OR this order is earlier than current known date
                if (!currentFirstSeen || new Date(o.created_at) < new Date(currentFirstSeen)) {
                    emailFirstSeen.set(email, o.created_at);
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

        // 3. Calculate Change for Customers
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
