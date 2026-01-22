import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { NextResponse } from "next/server";

// GET: Calculate cashflow summary (Total Income, Total Expenses, Net Profit)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build query with optional date filters
        let query = supabaseAdmin
            .schema('admin')
            .from('cashflow_transactions')
            .select('type, amount');

        if (startDate) {
            query = query.gte('date', startDate);
        }
        if (endDate) {
            query = query.lte('date', endDate);
        }

        const { data, error } = await query;

        if (error) {
            console.error("[Cashflow Summary] GET error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Calculate totals
        let totalIncome = 0;
        let totalExpenses = 0;

        for (const transaction of (data || [])) {
            if (transaction.type === 'income') {
                totalIncome += Number(transaction.amount) || 0;
            } else if (transaction.type === 'expense') {
                totalExpenses += Number(transaction.amount) || 0;
            }
        }

        const netProfit = totalIncome - totalExpenses;

        return NextResponse.json({
            totalIncome,
            totalExpenses,
            netProfit
        });
    } catch (err: any) {
        console.error("[Cashflow Summary] GET exception:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
