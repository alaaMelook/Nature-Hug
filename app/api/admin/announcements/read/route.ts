import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";

// POST /api/admin/announcements/read — Mark an announcement as read
export async function POST(req: NextRequest) {
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
        const { announcement_id } = body;

        if (!announcement_id) {
            return NextResponse.json({ success: false, error: "Announcement ID is required" }, { status: 400 });
        }

        const supabase = supabaseAdmin;

        // Fetch current read_by array
        const { data: announcement, error: fetchError } = await supabase.schema('store')
            .from('announcements')
            .select('read_by')
            .eq('id', announcement_id)
            .single();

        if (fetchError) throw fetchError;

        const readBy: number[] = announcement?.read_by || [];

        // Only add if not already read
        if (!readBy.includes(member.id)) {
            readBy.push(member.id);

            const { error: updateError } = await supabase.schema('store')
                .from('announcements')
                .update({ read_by: readBy })
                .eq('id', announcement_id);

            if (updateError) throw updateError;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[Announcements Read API] POST error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
