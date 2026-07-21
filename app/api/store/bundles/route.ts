import { NextResponse } from "next/server";
import { IProductServerRepository } from "@/data/repositories/server/iProductsRepository";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const lang = (url.searchParams.get("lang") as LangKey) || "ar";
        const repo = new IProductServerRepository(lang);
        const bundles = await repo.getStorefrontBundles();
        return NextResponse.json(bundles);
    } catch (error: any) {
        console.error("[API] GET /api/store/bundles error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
