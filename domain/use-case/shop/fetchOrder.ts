import {ICustomerServerRepository} from "@/data/repositories/server/iCustomerRepository";
import {OrderSummaryView} from "@/domain/entities/views/shop/orderSummaryView";
import {GetCurrentUser} from "@/domain/use-case/shop/getCurrentUser";

export class FetchOrder {
    constructor(private repo = new ICustomerServerRepository()) {
    }

    async execute(orderId: number): Promise<OrderSummaryView | null> {
        const user = await new GetCurrentUser().execute();
        if (!user) {
            throw new Error("User not authenticated");
        }
        return this.repo.viewOrder(orderId, user.id);
    }
}