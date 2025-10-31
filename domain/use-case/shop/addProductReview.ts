import {Review} from '@/domain/entities/database/review';
import {IProductServerRepository} from "@/data/repositories/server/iProductsRepository";

export class AddProductReview {
    constructor(private repo = new IProductServerRepository()) {
    }

    async execute(review: Partial<Review>): Promise<void> {
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
