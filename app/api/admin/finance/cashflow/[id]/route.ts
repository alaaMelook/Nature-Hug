import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { NextResponse } from "next/server";

// PUT: Update a cashflow transaction
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const { data, error } = await supabaseAdmin
            .schema('admin')
            .from('cashflow_transactions')
            .update({
                date: body.date,
                type: body.type,
                reference: body.reference,
                category_id: body.category_id,
                description: body.description,
                units: body.units,
                unit_price: body.unit_price,
                amount: body.amount,
                payment_method: body.payment_method,
                notes: body.notes
            })
            .eq('id', id)
            .select('*, cashflow_categories(id, name)')
            .single();

        if (error) {
            console.error("[Cashflow Transactions] PUT error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("[Cashflow Transactions] PUT exception:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE: Delete a cashflow transaction
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const { error } = await supabaseAdmin
            .schema('admin')
            .from('cashflow_transactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("[Cashflow Transactions] DELETE error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("[Cashflow Transactions] DELETE exception:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
