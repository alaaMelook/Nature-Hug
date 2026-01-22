import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { NextResponse } from "next/server";

// GET: Fetch all cashflow categories
export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .schema('admin')
            .from('cashflow_categories')
            .select('*')
            .order('name');

        if (error) {
            console.error("[Cashflow Categories] GET error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (err: any) {
        console.error("[Cashflow Categories] GET exception:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: Create a new cashflow category
export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .schema('admin')
            .from('cashflow_categories')
            .insert({
                name: body.name
            })
            .select()
            .single();

        if (error) {
            console.error("[Cashflow Categories] POST error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (err: any) {
        console.error("[Cashflow Categories] POST exception:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
