import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";

export class DeletePromoCode {
    private repository = new IAdminServerRepository();

    async execute(id: number): Promise<void> {
        return this.repository.deletePromoCode(id);
    }
}
