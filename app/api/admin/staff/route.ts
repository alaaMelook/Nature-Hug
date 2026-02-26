import { NextRequest, NextResponse } from "next/server";
import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";
import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";

// GET /api/admin/staff — List all staff members with their permissions
export async function GET() {
    try {
        const repo = new ICustomerServerRepository();
        const supabase = await createSupabaseServerClient();

        // Fetch all members with role = 'staff'
        const { data: staffMembers, error } = await supabase.schema('store')
            .from('members')
            .select(`
                id,
                user_id,
                role,
                created_at,
                customers!inner (
                    id,
                    name,
                    email,
                    phone
                )
            `)
            .eq('role', 'staff')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch permissions for each staff member
        const staffWithPermissions = await Promise.all(
            (staffMembers || []).map(async (member: any) => {
                const permissions = await repo.getMemberPermissions(member.id);
                return {
                    ...member,
                    permissions,
                };
            })
        );

        return NextResponse.json({ success: true, data: staffWithPermissions });
    } catch (error: any) {
        console.error("[Staff API] GET error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST /api/admin/staff — Create a new staff member
// Body: { mode: 'new' | 'existing', email?, password?, name?, customerId?, permissions: string[] }
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { mode, permissions = [] } = body;
        const repo = new ICustomerServerRepository();
        const supabase = await createSupabaseServerClient();

        let customerId: number;

        if (mode === 'new') {
            // Create a new auth user via Supabase Admin
            const { email, password, name } = body;
            if (!email || !password) {
                return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
            }

            // 1. Create auth user
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
            });
            if (authError) throw authError;

            const authUserId = authData.user.id;

            // 2. Create customer record
            const { data: customerData, error: customerError } = await supabase.schema('store')
                .from('customers')
                .insert({
                    name: name || email.split('@')[0],
                    email,
                    auth_user_id: authUserId,
                })
                .select('id')
                .single();
            if (customerError) throw customerError;

            customerId = customerData.id;

        } else if (mode === 'existing') {
            // Use existing customer
            customerId = body.customerId;
            if (!customerId) {
                return NextResponse.json({ success: false, error: "Customer ID is required" }, { status: 400 });
            }

            // Check if already a member
            const existingMember = await repo.fetchMember(customerId);
            if (existingMember) {
                // Update role to staff
                await repo.updateMember({ user_id: customerId, role: 'staff' });
                // Set permissions
                const updatedMember = await repo.fetchMember(customerId);
                if (updatedMember) {
                    await repo.setMemberPermissions(updatedMember.id, permissions);
                }
                return NextResponse.json({ success: true, message: "Customer updated to staff" });
            }
        } else {
            return NextResponse.json({ success: false, error: "Invalid mode" }, { status: 400 });
        }

        // 3. Add as member with staff role
        await repo.addMember({ user_id: customerId, role: 'staff' });

        // 4. Get the new member ID to set permissions
        const member = await repo.fetchMember(customerId);
        if (member && permissions.length > 0) {
            await repo.setMemberPermissions(member.id, permissions);
        }

        return NextResponse.json({ success: true, message: "Staff member created successfully" });
    } catch (error: any) {
        console.error("[Staff API] POST error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
