import { IProductRepository } from "@/data/repositories/iProductsRepository";
import { Category } from "@/domain/entities/database/category";

export class GetAllCategories {
    constructor(private repo = new IProductRepository()) { }

    async execute(): Promise<Category[]> {
        return await this.repo.getAllCategories();
    }
}

