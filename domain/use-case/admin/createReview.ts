import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";

export class CreateReview {
    constructor(private repo = new IAdminServerRepository()) {}

    async execute(review: {
        product_id: number;
        customer_name: string;
        rating: number;
        comment?: string;
        status: string;
    }): Promise<void> {
        return await this.repo.createReview(review);
    }
}
