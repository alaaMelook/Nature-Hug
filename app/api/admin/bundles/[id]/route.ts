import { NextResponse } from "next/server";
import { Bundles } from "@/domain/use-case/admin/bundles";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const bundle = await new Bundles().getById(parseInt(id));
        if (!bundle) {
            return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
        }
        return NextResponse.json(bundle);
    } catch (error: any) {
        console.error("[API] GET /api/admin/bundles/[id] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        await new Bundles().update({ ...body, id: parseInt(id) });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[API] PUT /api/admin/bundles/[id] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await new Bundles().delete(parseInt(id));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[API] DELETE /api/admin/bundles/[id] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
