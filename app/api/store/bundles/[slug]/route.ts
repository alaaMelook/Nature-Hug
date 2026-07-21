import { NextResponse } from "next/server";
import { IProductServerRepository } from "@/data/repositories/server/iProductsRepository";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const url = new URL(request.url);
        const lang = (url.searchParams.get("lang") as LangKey) || "ar";
        const repo = new IProductServerRepository(lang);
        const bundle = await repo.getStorefrontBundleDetail(slug);
        
        if (!bundle) {
            return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
        }
        
        return NextResponse.json(bundle);
    } catch (error: any) {
        console.error("[API] GET /api/store/bundles/[slug] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
