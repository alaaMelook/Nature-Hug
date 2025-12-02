import { IProductServerRepository } from "@/data/repositories/server/iProductsRepository";
import { ProductView } from "@/domain/entities/views/shop/productView";

export class ViewSimilarProducts {
    constructor(private lang: LangKey = 'ar', private repo = new IProductServerRepository(lang)) {
    }

    async execute(currentSlug: string): Promise<ProductView[]> {
        try {
            console.log("[ViewSimilarProducts] execute called with category:", currentSlug);
            const products = await this.repo.viewAll();
            // Filter out the current product
            const similarProducts = products.filter(p => p.slug !== currentSlug);

            // Optional: Limit the number of similar products (e.g., top 4)

            return [...similarProducts.sort((a, b) => b.stock - a.stock), ...similarProducts.sort((a, b) => b.stock - a.stock)];
        } catch (error) {
            console.error("[ViewSimilarProducts] Error in execute:", error);
            return [];
        }
    }
}
