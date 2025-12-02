import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { Material } from "@/domain/entities/database/material";

export class AddStock {
    constructor(private repo = new IAdminServerRepository()) { }

    async execute(type: 'material' | 'product', product: ProductAdminView | Material, quantity: number): Promise<void> {
        if (quantity <= 0) {
            throw new Error("Quantity must be greater than 0");
        }

        if (type === 'material') {
            await this.repo.addMaterialStock(product as Material, quantity);
        } else {
            await this.repo.addProductStock(product as ProductAdminView, quantity);
        }
    }
}
