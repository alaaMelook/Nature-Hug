import { IProductRepository } from "@/data/repositories/iProductsRepository";
import { supabase } from "@/data/supabase/client";
import { Category } from "@/domain/entities/database/category";

export class GetAllCategories {
    constructor(private repo = new IProductRepository()) { }

    async execute(): Promise<Category[]> {
        return await this.repo.getAllCategories();
    }
}

