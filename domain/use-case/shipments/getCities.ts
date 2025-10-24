// getCities.ts
import { ShipmentRepository } from "@/domain/repositories/shipmentRepository";
export class GetCities {
    constructor(private repo = ShipmentRepository) { }
    async execute() {
        return this.repo.getCities();
    }
}

// cancelShipment.ts

