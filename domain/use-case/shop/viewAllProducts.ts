import {IProductServerRepository} from '@/data/repositories/server/iProductsRepository';
import {ProductView} from '@/domain/entities/views/shop/productView';


export class ViewAllProducts {

    constructor(private repo = new IProductServerRepository()) {
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
}
