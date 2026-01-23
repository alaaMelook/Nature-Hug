import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { NextResponse } from "next/server";

// PUT: Update a cashflow category
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const { data, error } = await supabaseAdmin
            .schema('admin')
            .from('cashflow_categories')
            .update({
                name: body.name,
                exclude_from_opex: body.exclude_from_opex
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error("[Cashflow Categories] PUT error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("[Cashflow Categories] PUT exception:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE: Delete a cashflow category
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const { error } = await supabaseAdmin
            .schema('admin')
            .from('cashflow_categories')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("[Cashflow Categories] DELETE error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("[Cashflow Categories] DELETE exception:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
