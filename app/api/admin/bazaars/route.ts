import { NextResponse } from "next/server";
import { Bazaars } from "@/domain/use-case/admin/bazaars";

export async function GET() {
    try {
        const bazaars = await new Bazaars().getAllWithStats();
        return NextResponse.json(bazaars);
    } catch (error: any) {
        console.error("[API] GET /api/admin/bazaars error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const id = await new Bazaars().create(body);
        return NextResponse.json({ id });
    } catch (error: any) {
        console.error("[API] POST /api/admin/bazaars error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
