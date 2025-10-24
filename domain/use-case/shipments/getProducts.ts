
// getProducts.ts
import { ShipmentRepository } from "@/domain/repositories/shipmentRepository";
export class GetProducts {
    constructor(private repo = ShipmentRepository) { }
    async execute() {
        return this.repo.getProducts();
    }
}

