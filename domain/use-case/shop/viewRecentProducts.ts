import { IProductRepository } from '@/data/repositories/iProductsRepository';
import { ProductView } from '@/domain/entities/views/shop/productView';


export class ViewRecentProducts {
    constructor(private repo = new IProductRepository()) { }

    async execute(count: number = 4): Promise<ProductView[]> {
        return await this.repo.viewRecent(count);
    }

}