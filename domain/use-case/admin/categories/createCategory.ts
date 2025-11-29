import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { Category } from "@/domain/entities/database/category";

export class CreateCategory {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute(category: Partial<Category>): Promise<void> {
        try {
            console.log("[CreateCategory] execute called with:", category);
            await this.repo.createCategory(category);
            console.log("[CreateCategory] executed successfully");
        } catch (error) {
            console.error("[CreateCategory] Error in execute:", error);
            throw error;
        }
    }
}
