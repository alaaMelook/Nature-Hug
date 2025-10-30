// getCities.ts
import { ShipmentRepository } from "@/domain/repositories/shipmentRepository";
export class GetCities {
    constructor(private repo = ShipmentRepository) { }
    async execute() {
        try {
            console.log("[GetCities] execute called.");
            const result = await this.repo.getCities();
            console.log("[GetCities] getCities result:", result);
            return result;
        } catch (error) {
            console.error("[GetCities] Error in execute:", error);
            throw error;
        }
    }
}

// cancelShipment.ts
