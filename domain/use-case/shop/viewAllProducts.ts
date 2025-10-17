import { IProductRepository } from '@/data/repositories/iProductsRepository';
import { ProductView } from '@/domain/entities/views/shop/productView';


export class ViewAllProducts {

    constructor(private repo = new IProductRepository()) { }

    async execute(): Promise<ProductView[]> {
        return await this.repo.viewAll();
    }
} 
