import { IProductServerRepository } from '@/data/repositories/server/iProductsRepository';
import { ProductView } from '@/domain/entities/views/shop/productView';


export class ViewRecentProducts {
    constructor(private lang: LangKey = 'ar', private repo = new IProductServerRepository(lang)) {
    }

    async execute(count: number = 4): Promise<ProductView[]> {
        return await this.repo.viewRecent(count);
    }

}