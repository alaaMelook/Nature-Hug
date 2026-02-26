import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";

// GET /api/admin/staff/search?q=... — Search customers for staff promotion
export async function GET(req: NextRequest) {
    try {
        const q = req.nextUrl.searchParams.get('q') || '';
        if (q.length < 2) {
            return NextResponse.json({ success: true, data: [] });
        }

        const supabase = await createSupabaseServerClient();

        // Search customers by name or email
        const { data, error } = await supabase.schema('store')
            .from('customers')
            .select('id, name, email, phone')
            .or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
            .limit(10);

        if (error) throw error;

        return NextResponse.json({ success: true, data: data || [] });
    } catch (error: any) {
        console.error("[Staff Search API] error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
