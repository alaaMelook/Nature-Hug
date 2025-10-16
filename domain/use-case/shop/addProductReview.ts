import { IProductRepository } from '@/data/repositories/iProductsRepository';
import { Review } from '@/domain/entities/database/review';



/** Fetch all products for product listing page */
export async function addProductReview(review: Review): Promise<void> {
    let ProductRepository = new IProductRepository();
    await ProductRepository.addReview(review);
}
