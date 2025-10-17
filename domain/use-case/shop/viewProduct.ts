import { IProductRepository } from "@/data/repositories/iProductsRepository";
import { ProductDetailView } from "@/domain/entities/views/shop/productDetailView";


export class ViewProduct {
    constructor(private repo = new IProductRepository()) { }

    async execute(slug: string): Promise<ProductDetailView> {
        return await this.repo.viewBySlug(slug);
    }
}