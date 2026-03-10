import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";

// GET /api/admin/announcements — Fetch announcements
export async function GET(req: NextRequest) {
    try {
        const user = await new GetCurrentUser().execute();
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const repo = new ICustomerServerRepository();
        const member = await repo.fetchMember(user.id);
        if (!member) {
            return NextResponse.json({ success: false, error: "Not a member" }, { status: 403 });
        }

        const supabase = supabaseAdmin;

        let query = supabase.schema('store')
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

        // If staff, only show announcements targeted to 'all' or to their specific member_id
        if (member.role === 'staff') {
            query = query.or(`target.eq.all,target_member_id.eq.${member.id}`);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Get staff list for admin to show target names
        let staffList: any[] = [];
        if (member.role === 'admin') {
            const { data: staffData } = await supabase.schema('store')
                .from('members')
                .select(`
                    id,
                    user_id,
                    role,
                    customers!inner (
                        id,
                        name,
                        email
                    )
                `)
                .eq('role', 'staff');
            staffList = staffData || [];
        }

        return NextResponse.json({
            success: true,
            data: data || [],
            staffList,
            currentMemberId: member.id,
        });
    } catch (error: any) {
        console.error("[Announcements API] GET error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST /api/admin/announcements — Create a new announcement (admin only)
export async function POST(req: NextRequest) {
    try {
        const user = await new GetCurrentUser().execute();
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const repo = new ICustomerServerRepository();
        const member = await repo.fetchMember(user.id);
        if (!member || member.role !== 'admin') {
            return NextResponse.json({ success: false, error: "Only admins can create announcements" }, { status: 403 });
        }

        const body = await req.json();
        const { title, message, target, target_member_id } = body;

        if (!title || !message) {
            return NextResponse.json({ success: false, error: "Title and message are required" }, { status: 400 });
        }

        if (target === 'specific' && !target_member_id) {
            return NextResponse.json({ success: false, error: "Target member is required for specific announcements" }, { status: 400 });
        }

        const supabase = supabaseAdmin;

        const { data, error } = await supabase.schema('store')
            .from('announcements')
            .insert({
                title,
                message,
                target: target || 'all',
                target_member_id: target === 'specific' ? target_member_id : null,
                created_by: user.id,
                read_by: [],
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("[Announcements API] POST error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE /api/admin/announcements — Delete an announcement (admin only)
export async function DELETE(req: NextRequest) {
    try {
        const user = await new GetCurrentUser().execute();
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const repo = new ICustomerServerRepository();
        const member = await repo.fetchMember(user.id);
        if (!member || member.role !== 'admin') {
            return NextResponse.json({ success: false, error: "Only admins can delete announcements" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ success: false, error: "Announcement ID is required" }, { status: 400 });
        }

        const supabase = supabaseAdmin;

        const { error } = await supabase.schema('store')
            .from('announcements')
            .delete()
            .eq('id', parseInt(id));

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[Announcements API] DELETE error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PATCH /api/admin/announcements — Edit an announcement or add reaction
export async function PATCH(req: NextRequest) {
    try {
        const user = await new GetCurrentUser().execute();
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const repo = new ICustomerServerRepository();
        const member = await repo.fetchMember(user.id);
        if (!member) {
            return NextResponse.json({ success: false, error: "Not a member" }, { status: 403 });
        }

        const body = await req.json();
        const { type } = body;

        const supabase = supabaseAdmin;

        // Handle reaction
        if (type === 'reaction') {
            const { announcement_id, emoji } = body;
            if (!announcement_id || !emoji) {
                return NextResponse.json({ success: false, error: "Announcement ID and emoji are required" }, { status: 400 });
            }

            // Fetch current reactions
            const { data: announcement, error: fetchError } = await supabase.schema('store')
                .from('announcements')
                .select('reactions')
                .eq('id', announcement_id)
                .single();

            if (fetchError) throw fetchError;

            const reactions: Record<string, number[]> = announcement?.reactions || {};
            
            // Toggle reaction: if user already reacted with this emoji, remove it
            if (reactions[emoji]?.includes(member.id)) {
                reactions[emoji] = reactions[emoji].filter((id: number) => id !== member.id);
                if (reactions[emoji].length === 0) delete reactions[emoji];
            } else {
                if (!reactions[emoji]) reactions[emoji] = [];
                reactions[emoji].push(member.id);
            }

            const { error: updateError } = await supabase.schema('store')
                .from('announcements')
                .update({ reactions })
                .eq('id', announcement_id);

            if (updateError) throw updateError;

            return NextResponse.json({ success: true, reactions });
        }

        // Handle edit (admin only)
        if (member.role !== 'admin') {
            return NextResponse.json({ success: false, error: "Only admins can edit announcements" }, { status: 403 });
        }

        const { id, title, message, target, target_member_id } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: "Announcement ID is required" }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (message !== undefined) updateData.message = message;
        if (target !== undefined) updateData.target = target;
        if (target !== undefined) updateData.target_member_id = target === 'specific' ? target_member_id : null;

        const { data, error } = await supabase.schema('store')
            .from('announcements')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("[Announcements API] PATCH error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

