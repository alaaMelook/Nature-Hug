import { IProductRepository } from '@/data/repositories/iProductsRepository';
import { ProductView } from '@/domain/entities/views/shop/productView';



/** Fetch all products for product listing page */
export async function viewRecentProducts(): Promise<ProductView[]> {
    let ProductRepository = new IProductRepository();
    return await ProductRepository.viewRecent(4);
}
