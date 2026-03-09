import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/data/datasources/supabase/admin";

// DEBUG: Temporary endpoint to check bazaar orders in database
export async function GET() {
    try {
        // Check recent orders and their bazaar_id
        const { data: orders, error } = await supabaseAdmin.schema('store')
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
        }

        // Check if bazaar_id column exists
        const { data: bazaars } = await supabaseAdmin.schema('store')
            .from('bazaars')
            .select('id, name');

        return NextResponse.json({
            message: "Debug: Recent orders and bazaars",
            orders: orders || [],
            bazaars: bazaars || [],
            ordersWithBazaar: (orders || []).filter((o: any) => o.bazaar_id !== null),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
