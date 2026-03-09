import { NextResponse } from "next/server";
import { Bazaars } from "@/domain/use-case/admin/bazaars";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const bazaarId = parseInt(id);
        const bazaars = new Bazaars();

        const [bazaar, report, orders] = await Promise.all([
            bazaars.getById(bazaarId),
            bazaars.getReport(bazaarId),
            bazaars.getOrders(bazaarId),
        ]);

        if (!bazaar) {
            return NextResponse.json({ error: "Bazaar not found" }, { status: 404 });
        }

        return NextResponse.json({ bazaar, report, orders });
    } catch (error: any) {
        console.error("[API] GET /api/admin/bazaars/[id] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        await new Bazaars().update({ ...body, id: parseInt(id) });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[API] PUT /api/admin/bazaars/[id] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await new Bazaars().delete(parseInt(id));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[API] DELETE /api/admin/bazaars/[id] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
