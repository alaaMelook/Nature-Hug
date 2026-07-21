import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";

export class DeleteReview {
    constructor(private repo = new IAdminServerRepository()) {}

    async execute(reviewId: number): Promise<void> {
        return await this.repo.deleteReview(reviewId);
    }
}
