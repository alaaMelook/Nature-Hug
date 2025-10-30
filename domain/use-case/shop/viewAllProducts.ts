import {IProductRepository} from '@/data/repositories/iProductsRepository';
import {ProductView} from '@/domain/entities/views/shop/productView';


export class ViewAllProducts {

    constructor() {
    }

    async execute(useClient: boolean = false): Promise<ProductView[]> {
        try {
            const repo = new IProductRepository(useClient);
            console.log("[ViewAllProducts] execute called.");
            const result = await repo.viewAll();
            console.log("[ViewAllProducts] viewAll result:", result);
            return result;
        } catch (error) {
            console.error("[ViewAllProducts] Error in execute:", error);
            throw error;
        }
    }
}
