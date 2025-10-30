// getProducts.ts
import { ShipmentRepository } from "@/domain/repositories/shipmentRepository";
export class GetProducts {
    constructor(private repo = ShipmentRepository) { }
    async execute() {
        try {
            console.log("[GetProducts] execute called.");
            const result = await this.repo.getProducts();
            console.log("[GetProducts] getProducts result:", result);
            return result;
        } catch (error) {
            console.error("[GetProducts] Error in execute:", error);
            throw error;
        }
    }
}
