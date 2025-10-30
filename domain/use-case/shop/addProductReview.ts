import { IProductRepository } from '@/data/repositories/iProductsRepository';
import { Review } from '@/domain/entities/database/review';

export class AddProductReview {
    constructor(private repo = new IProductRepository()) { }

    async execute(review: Review): Promise<void> {
        try {
            console.log("[AddProductReview] execute called with review:", review);
            await this.repo.addReview(review);
            console.log("[AddProductReview] addReview completed.");
        } catch (error) {
            console.error("[AddProductReview] Error in execute:", error);
            throw error;
        }
    }
}
