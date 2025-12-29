import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";

export class GetProductForEdit {
    constructor(private repo = new IAdminServerRepository()) { }

    async execute(slug: string): Promise<ProductAdminView | null> {
        try {
            console.log("[GetProductForEdit] Fetching product with slug:", slug);
            return await this.repo.getProductForEdit(slug);
        } catch (error) {
            console.error("[GetProductForEdit] Error:", error);
            throw error;
        }
    }
}
