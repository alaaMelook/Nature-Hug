import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { BundleAdminView } from "@/domain/entities/views/admin/bundleAdminView";

export class Bundles {
    constructor(private repo = new IAdminServerRepository()) {}

    async getAll() {
        return await this.repo.getAllBundles();
    }

    async getById(id: number) {
        return await this.repo.getBundleById(id);
    }

    async create(bundle: Partial<BundleAdminView>) {
        return await this.repo.createBundle(bundle);
    }

    async update(bundle: Partial<BundleAdminView>) {
        return await this.repo.updateBundle(bundle);
    }

    async delete(id: number) {
        return await this.repo.deleteBundle(id);
    }

    async duplicate(id: number) {
        return await this.repo.duplicateBundle(id);
    }

    async getAllProducts() {
        return await this.repo.getAllProducts();
    }

    async getProductsByCategory(categoryId: number) {
        return await this.repo.getProductsByCategory(categoryId);
    }

    async getVariantsByProduct(productId: number) {
        return await this.repo.getVariantsByProduct(productId);
    }
}
