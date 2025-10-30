import { IProductRepository } from "@/data/repositories/iProductsRepository";
import { ProductDetailView } from "@/domain/entities/views/shop/productDetailView";


export class ViewProduct {
    constructor(private repo = new IProductRepository()) { }

    async execute(slug: string): Promise<ProductDetailView> {
        try {
            console.log("[ViewProduct] execute called with slug:", slug);
            const result = await this.repo.viewBySlug(slug);
            console.log("[ViewProduct] viewBySlug result:", result);
            return result;
        } catch (error) {
            console.error("[ViewProduct] Error in execute:", error);
            throw error; // Ensure the error is re-thrown
        }
    }
}