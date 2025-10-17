import { IProductRepository } from '@/data/repositories/iProductsRepository';
import { Review } from '@/domain/entities/database/review';



export class AddProductReview {

    constructor(private repo = new IProductRepository()) { }

    async execute(review: Review): Promise<void> {
        await this.repo.addReview(review);
    }
}
