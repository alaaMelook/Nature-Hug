import { IProductRepository } from "@/data/repositories/iProductsRepository";
import { ProductDetailView } from "@/domain/entities/views/shop/productDetailView";

export async function viewProduct(slug: string): Promise<ProductDetailView> {
    let ProductRepository = new IProductRepository();
    return await ProductRepository.viewBySlug(slug);
}