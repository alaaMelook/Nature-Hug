import { NextResponse } from "next/server";
import { Bazaars } from "@/domain/use-case/admin/bazaars";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const bazaarId = parseInt(id);
        const expenses = await new Bazaars().getExpenses(bazaarId);
        return NextResponse.json({ success: true, data: expenses });
    } catch (error: any) {
        console.error("[API] GET /api/admin/bazaars/[id]/expenses error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const bazaarId = parseInt(id);
        const body = await request.json();
        const expenseId = await new Bazaars().addExpense({
            ...body,
            bazaar_id: bazaarId,
        });
        return NextResponse.json({ success: true, id: expenseId });
    } catch (error: any) {
        console.error("[API] POST /api/admin/bazaars/[id]/expenses error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
