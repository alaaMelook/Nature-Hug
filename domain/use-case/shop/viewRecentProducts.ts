import {IProductRepository} from '@/data/repositories/iProductsRepository';
import {ProductView} from '@/domain/entities/views/shop/productView';


export class ViewRecentProducts {
    constructor() {
    }

    async execute(count: number = 4, useClient: boolean = false): Promise<ProductView[]> {
        const repo = new IProductRepository(useClient)
        return await repo.viewRecent(count);
    }

}