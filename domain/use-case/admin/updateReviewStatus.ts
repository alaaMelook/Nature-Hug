import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";

export class UpdateReviewStatus {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute(reviewId: number, status: 'approved' | 'rejected' | 'pending'): Promise<void> {
        return await this.repo.updateReviewStatus(reviewId, status);
    }
}
