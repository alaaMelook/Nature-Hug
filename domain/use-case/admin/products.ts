import {IAdminServerRepository} from "@/data/repositories/server/iAdminRepository";
import {ProductAdminView} from "@/domain/entities/views/admin/productAdminView";


export class GetAllProductsWithDetails {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute(): Promise<ProductAdminView[]> {
        return await this.repo.viewAllWithDetails();
    }
}

export class AddProduct {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute(product: ProductAdminView): Promise<number> {
        return await this.repo.createProduct(product);
    }
}

export class DeleteProduct {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute(slug: string): Promise<void> {
        return await this.repo.deleteProduct(slug);
    }
}

export class UpdateProduct {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute(product: ProductAdminView): Promise<number | void> {
        return await this.repo.updateProduct(product);
    }
}