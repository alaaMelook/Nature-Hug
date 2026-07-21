import { NextResponse } from "next/server";
import { Bundles } from "@/domain/use-case/admin/bundles";

export async function GET() {
    try {
        const bundles = await new Bundles().getAll();
        return NextResponse.json(bundles);
    } catch (error: any) {
        console.error("[API] GET /api/admin/bundles error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const id = await new Bundles().create(body);
        return NextResponse.json({ id });
    } catch (error: any) {
        console.error("[API] POST /api/admin/bundles error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
