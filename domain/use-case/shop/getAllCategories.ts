import {IProductServerRepository} from "@/data/repositories/server/iProductsRepository";
import {Category} from "@/domain/entities/database/category";

export class GetAllCategories {
    constructor(private repo = new IProductServerRepository()) {
    }

    async execute(): Promise<Category[]> {
        try {
            console.log("[GetAllCategories] execute called.");
            const result = await this.repo.getAllCategories();
            console.log("[GetAllCategories] getAllCategories result:", result);
            return result;
        } catch (error) {
            console.error("[GetAllCategories] Error in execute:", error);
            throw error;
        }
    }
}
