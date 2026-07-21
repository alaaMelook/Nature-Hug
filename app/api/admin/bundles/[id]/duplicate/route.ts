import { NextResponse } from "next/server";
import { Bundles } from "@/domain/use-case/admin/bundles";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const newId = await new Bundles().duplicate(parseInt(id));
        return NextResponse.json({ success: true, id: newId });
    } catch (error: any) {
        console.error("[API] POST /api/admin/bundles/[id]/duplicate error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
