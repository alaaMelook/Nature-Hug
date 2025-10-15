import { ProductDetailView } from "@/domain/entities/views/shop/productDetailView";
import { ProductRepository } from "@/domain/repositories/productRepository";

export async function viewProduct(slug: string): Promise<ProductDetailView> {
    return await ProductRepository.viewBySlug(slug);
}