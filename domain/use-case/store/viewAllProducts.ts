import { IProductServerRepository } from '@/data/repositories/server/iProductsRepository';
import { ProductView } from '@/domain/entities/views/shop/productView';


export class ViewAllProducts {

    constructor(private lang: LangKey = 'ar', private repo = new IProductServerRepository(lang)) {
    }

    async execute(): Promise<ProductView[]> {
        try {

            console.log("[ViewAllProducts] execute called.");
            const result = await this.repo.viewAll();
            console.log("[ViewAllProducts] viewAll result:", result);
            return result;
        } catch (error) {
            console.error("[ViewAllProducts] Error in execute:", error);
            throw error;
        }
    }
    async bySlug(slug: string): Promise<ProductView> {
        try {
            console.log("[ViewAllProducts] bySlug called.");
            const result = await this.repo.viewBySlug(slug);
            console.log("[ViewAllProducts] bySlug result:", result);
            return result;
        } catch (error) {
            console.error("[ViewAllProducts] Error in bySlug:", error);
            throw error;
        }
    }
    async batchBySlugs(slugs: string[]): Promise<ProductView[]> {
        try {
            console.log("[ViewAllProducts] batchBySlugs called.");
            const result = await this.repo.viewBySlugs(slugs);
            console.log("[ViewAllProducts] batchBySlugs result:", result);
            return result;
        } catch (error) {
            console.error("[ViewAllProducts] Error in batchBySlugs:", error);
            throw error;
        }
    }
}
