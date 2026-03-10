import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";

// GET /api/admin/payment-info — Fetch all payment info
export async function GET() {
    try {
        const { data, error } = await supabaseAdmin.schema('store')
            .from('payment_info')
            .select('*')
            .order('method');

        if (error) throw error;

        return NextResponse.json({ success: true, data: data || [] });
    } catch (error: any) {
        console.error("[Payment Info API] GET error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PATCH /api/admin/payment-info — Update payment info (admin only)
export async function PATCH(req: NextRequest) {
    try {
        const user = await new GetCurrentUser().execute();
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const repo = new ICustomerServerRepository();
        const member = await repo.fetchMember(user.id);
        if (!member || member.role !== 'admin') {
            return NextResponse.json({ success: false, error: "Admin only" }, { status: 403 });
        }

        const body = await req.json();
        const { method, account_number, account_name, qr_code_url } = body;

        if (!method) {
            return NextResponse.json({ success: false, error: "Method is required" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin.schema('store')
            .from('payment_info')
            .upsert({
                method,
                account_number: account_number || null,
                account_name: account_name || null,
                qr_code_url: qr_code_url || null,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'method' })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("[Payment Info API] PATCH error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
