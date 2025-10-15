import { ProductView } from '@/domain/entities/views/shop/productView';
import { ProductRepository } from '@/domain/repositories/productRepository';


/** Fetch all products for product listing page */
export async function viewAllProducts(): Promise<ProductView[]> {
    return await ProductRepository.viewAll();
}
