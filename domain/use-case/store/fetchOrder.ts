import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";
import { OrderSummaryView } from "@/domain/entities/views/shop/orderSummaryView";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";

export class FetchOrder {
    constructor(private repo = new ICustomerServerRepository()) {
    }

    async execute(orderId: number, customerId: number | null): Promise<OrderSummaryView | null> {
        let userId = customerId;
        if (!userId) {
            const user = await new GetCurrentUser().execute();
            if (!user) {
                return null;
            }
            userId = user.id;
        }

        return this.repo.viewOrder(orderId, userId);

    }
}