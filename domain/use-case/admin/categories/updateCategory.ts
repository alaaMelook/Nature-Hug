import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { Category } from "@/domain/entities/database/category";

export class UpdateCategory {
    async execute(category: Partial<Category>): Promise<void> {
        const repo = new IAdminServerRepository();
        await repo.updateCategory(category);
    }
}
