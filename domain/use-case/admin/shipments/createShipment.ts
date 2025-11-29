import { Shipment } from "@/domain/entities/shipment/shipment";
import { ShipmentRepository } from "@/domain/repositories/shipmentRepository";

export class CreateShipment {
    constructor(private repo = ShipmentRepository) { }

    async execute(shipment: Shipment): Promise<any> {
        try {
            console.log("[CreateShipment] execute called with:", shipment);
            // await this.repo.login();
            const result = await this.repo.createShipment(shipment);
            console.log("[CreateShipment] Shipment created successfully:", result);
            return result;
        } catch (error) {
            console.error("[CreateShipment] Error creating shipment:", error);
            throw error;
        }
    }
}
