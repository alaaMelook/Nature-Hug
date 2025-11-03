import {ICustomerServerRepository} from "@/data/repositories/server/iCustomerRepository";
import {OrderSummaryView} from "@/domain/entities/views/shop/orderSummaryView";
import {GetCurrentUser} from "@/domain/use-case/shop/getCurrentUser";

export class FetchOrders {
    constructor(private repo = new ICustomerServerRepository()) {
    }

    async execute(): Promise<OrderSummaryView[]> {
        const user = await new GetCurrentUser().execute();
        if (!user) {
            throw new Error("User not authenticated");
        }
        return this.repo.viewAllOrders(user.id);
    }
}