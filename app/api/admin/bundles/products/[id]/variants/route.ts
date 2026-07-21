import { NextResponse } from "next/server";
import { Bundles } from "@/domain/use-case/admin/bundles";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const variants = await new Bundles().getVariantsByProduct(parseInt(id));
        return NextResponse.json(variants);
    } catch (error: any) {
        console.error("[API] GET /api/admin/bundles/products/[id]/variants error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
