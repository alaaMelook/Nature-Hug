import {Order} from "@/domain/entities/database/order";
import {ICustomerServerRepository} from "@/data/repositories/server/iCustomerRepository";

export class CreateOrder {
    constructor(private repo = new ICustomerServerRepository()) {
    }

    async execute(order: Partial<Order>): Promise<{ order_id: number, customer_id: number }> {
        try {
            console.log("[CreateOrder] execute called with order:", order);
            const data = await this.repo.createOrder(order);
            console.log("[CreateOrder] createOrder completed.");
            return data;
        } catch (error) {
            console.error("[CreateOrder] Error in execute:", error);
            throw error;
        }
    }
}
