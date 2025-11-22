import { IProductServerRepository } from "@/data/repositories/server/iProductsRepository";
import { ProductDetailView } from "@/domain/entities/views/shop/productDetailView";


export class ViewProduct {
    constructor(private lang: LangKey = 'ar', private repo = new IProductServerRepository(lang)) {
    }

    async execute(slug: string): Promise<ProductDetailView> {
        try {
            console.log("[ViewProduct] execute called with slug:", slug);
            const result = await this.repo.viewDetailedBySlug(slug);
            console.log("[ViewProduct] viewBySlug result:", result);
            return result;
        } catch (error) {
            console.error("[ViewProduct] Error in execute:", error);
            throw error; // Ensure the error is re-thrown
        }
    }
}