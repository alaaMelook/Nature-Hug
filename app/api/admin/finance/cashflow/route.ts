import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { NextResponse } from "next/server";

// GET: Fetch all cashflow transactions with category info
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const type = searchParams.get('type');
        const categoryId = searchParams.get('categoryId');

        let query = supabaseAdmin
            .schema('admin')
            .from('cashflow_transactions')
            .select('*, cashflow_categories(id, name)')
            .order('date', { ascending: false });

        // Apply filters
        if (startDate) {
            query = query.gte('date', startDate);
        }
        if (endDate) {
            query = query.lte('date', endDate);
        }
        if (type && ['income', 'expense'].includes(type)) {
            query = query.eq('type', type);
        }
        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) {
            console.error("[Cashflow Transactions] GET error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (err: any) {
        console.error("[Cashflow Transactions] GET exception:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: Create a new cashflow transaction
export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.type || !body.amount) {
            return NextResponse.json({ error: "Type and amount are required" }, { status: 400 });
        }

        if (!['income', 'expense'].includes(body.type)) {
            return NextResponse.json({ error: "Type must be 'income' or 'expense'" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .schema('admin')
            .from('cashflow_transactions')
            .insert({
                date: body.date || new Date().toISOString().split('T')[0],
                type: body.type,
                reference: body.reference || null,
                category_id: body.category_id || null,
                description: body.description || null,
                units: body.units || 1,
                unit_price: body.unit_price || null,
                amount: body.amount,
                payment_method: body.payment_method || 'cash',
                notes: body.notes || null
            })
            .select('*, cashflow_categories(id, name)')
            .single();

        if (error) {
            console.error("[Cashflow Transactions] POST error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (err: any) {
        console.error("[Cashflow Transactions] POST exception:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
