import { NextRequest, NextResponse } from "next/server";
import { AdminSettingsUseCase } from "@/domain/use-case/admin/settings";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";
import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";

const settingsUseCase = new AdminSettingsUseCase();

export async function GET() {
    try {
        const settings = await settingsUseCase.getSettings();
        return NextResponse.json({ success: true, settings });
    } catch (error: any) {
        console.error("[Settings API] GET error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const user = await new GetCurrentUser().execute();
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const repo = new ICustomerServerRepository();
        const member = await repo.fetchMember(user.id);
        if (!member || (member.role !== 'admin' && member.role !== 'staff')) {
            return NextResponse.json({ success: false, error: "Forbidden: Admin or staff only" }, { status: 403 });
        }

        const body = await req.json();
        const updated = await settingsUseCase.updateSettings(body);
        return NextResponse.json({ success: true, settings: updated });
    } catch (error: any) {
        console.error("[Settings API] PATCH error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    return PATCH(req);
}
