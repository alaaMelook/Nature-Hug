import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { PromoCode } from "@/domain/entities/database/promoCode";

export class UpdatePromoCode {
    private repository = new IAdminServerRepository();

    async execute(promoCode: Partial<PromoCode>): Promise<void> {
        return this.repository.updatePromoCode(promoCode);
    }
}
