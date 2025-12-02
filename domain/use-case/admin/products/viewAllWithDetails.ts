import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";

export class ViewAllWithDetails {
    private repository = new IAdminServerRepository();

    async execute(): Promise<ProductAdminView[]> {
        return this.repository.viewAllWithDetails();
    }
}
