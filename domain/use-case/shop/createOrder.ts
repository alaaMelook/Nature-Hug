import {Order} from "@/domain/entities/database/order";
import {ICustomerServerRepository} from "@/data/repositories/server/iCustomerRepository";

export class CreateOrder {
    constructor(private repo = new ICustomerServerRepository()) {
    }

    async execute(order: Partial<Order>): Promise<number> {
        try {
            console.log("[CreateOrder] execute called with order:", order);
            const id = await this.repo.createOrder(order);
            console.log("[CreateOrder] createOrder completed.");
            return id;
        } catch (error) {
            console.error("[CreateOrder] Error in execute:", error);
            throw error;
        }
    }
}
