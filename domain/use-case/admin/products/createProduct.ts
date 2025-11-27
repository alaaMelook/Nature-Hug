import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";

export class CreateProduct {
    constructor(private repo = new IAdminServerRepository()) { }

    async execute(product: ProductAdminView): Promise<number> {
        try {
            console.log("[CreateProduct] execute called with:", product);
            const id = await this.repo.createProduct(product);
            console.log("[CreateProduct] Product created successfully.");
            return id;
        } catch (error) {
            console.error("[CreateProduct] Error creating product:", error);
            throw error;
        }
    }
}
