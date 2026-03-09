import { IProductServerRepository } from "@/data/repositories/server/iProductsRepository";
import { PromoCode } from "@/domain/entities/database/promoCode";

export class GetAutoApplyPromoCodes {
    constructor(private repo = new IProductServerRepository()) { }

    async execute(customerId?: number): Promise<PromoCode[]> {
        const promoCodes = await this.repo.getAutoApplyPromoCodes();

        // Filter by customer eligibility and exclude bazaar-only codes
        return promoCodes.filter(promo => {
            // Exclude bazaar-only promo codes from online checkout
            if (promo.bazaar_only) return false;

            // If promo has eligible_customer_ids, check if current customer is eligible
            if (promo.eligible_customer_ids && promo.eligible_customer_ids.length > 0) {
                // If no customerId provided, exclude customer-specific codes
                if (!customerId) return false;
                return promo.eligible_customer_ids.includes(customerId);
            }
            // Code is available for all customers
            return true;
        });
    }
}
