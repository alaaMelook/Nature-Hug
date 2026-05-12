import { NextResponse } from "next/server";
import { Bazaars } from "@/domain/use-case/admin/bazaars";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string; expenseId: string }> }) {
    try {
        const { expenseId } = await params;
        const body = await request.json();
        await new Bazaars().updateExpense({ ...body, id: parseInt(expenseId) });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[API] PUT /api/admin/bazaars/[id]/expenses/[expenseId] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; expenseId: string }> }) {
    try {
        const { expenseId } = await params;
        await new Bazaars().deleteExpense(parseInt(expenseId));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[API] DELETE /api/admin/bazaars/[id]/expenses/[expenseId] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
