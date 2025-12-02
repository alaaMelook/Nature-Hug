import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { PromoCode } from "@/domain/entities/database/promoCode";

export class GetAllPromoCodes {
    private repository = new IAdminServerRepository();

    async execute(): Promise<PromoCode[]> {
        return this.repository.getAllPromoCodes();
    }
}
