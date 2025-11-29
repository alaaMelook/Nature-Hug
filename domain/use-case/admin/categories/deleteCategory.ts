import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";

export class DeleteCategory {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute(id: number): Promise<void> {
        try {
            console.log("[DeleteCategory] execute called with id:", id);
            await this.repo.deleteCategory(id);
            console.log("[DeleteCategory] executed successfully");
        } catch (error) {
            console.error("[DeleteCategory] Error in execute:", error);
            throw error;
        }
    }
}
