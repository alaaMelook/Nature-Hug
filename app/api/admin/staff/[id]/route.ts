import { NextRequest, NextResponse } from "next/server";
import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";

// PUT /api/admin/staff/[id] — Update staff member (name + permissions)
// [id] is the member ID (not customer ID)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const memberId = parseInt(id);
        const body = await req.json();
        const { permissions = [], name, customerId } = body;

        const repo = new ICustomerServerRepository();
        await repo.setMemberPermissions(memberId, permissions);

        // Update customer name if provided
        if (name !== undefined && customerId) {
            const supabase = await createSupabaseServerClient();
            await supabase.schema('store')
                .from('customers')
                .update({ name })
                .eq('id', customerId);
        }

        return NextResponse.json({ success: true, message: "Staff member updated" });
    } catch (error: any) {
        console.error("[Staff API] PUT error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE /api/admin/staff/[id] — Remove staff member
// [id] is the customer/user ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const customerId = parseInt(id);

        const repo = new ICustomerServerRepository();
        await repo.removeMember(customerId);

        return NextResponse.json({ success: true, message: "Staff member removed" });
    } catch (error: any) {
        console.error("[Staff API] DELETE error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
