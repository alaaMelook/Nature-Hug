import { IProductRepository } from '@/data/repositories/iProductsRepository';
import { Review } from '@/domain/entities/database/review';
import {Order} from "@/domain/entities/database/order";

export class CreateOrder {
    constructor(private repo = new IProductRepository()) { }

    async execute(order: Order): Promise<void> {
        try {
            console.log("[CreateOrder] execute called with order:", order);
            await this.repo.createOrder(order);
            console.log("[CreateOrder] createOrder completed.");
        } catch (error) {
            console.error("[CreateOrder] Error in execute:", error);
            throw error;
        }
    }
}
