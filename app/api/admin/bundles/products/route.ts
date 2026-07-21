import { NextResponse } from "next/server";
import { Bundles } from "@/domain/use-case/admin/bundles";

export async function GET() {
    try {
        const products = await new Bundles().getAllProducts();
        return NextResponse.json(products);
    } catch (error: any) {
        console.error("[API] GET /api/admin/bundles/products error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
