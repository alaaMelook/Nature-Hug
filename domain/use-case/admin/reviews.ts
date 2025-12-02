import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { Review } from "@/domain/entities/database/review";
import { ReviewAdminView } from "@/domain/entities/views/admin/reviewAdminView";

export class GetAllReviews {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute(): Promise<ReviewAdminView[]> {
        return await this.repo.seeAllReviews();
    }
}
