import { Shipment } from "@/domain/entities/shipment/shipment";
import { IShipmentRepository } from "@/data/repositories/iShipmentRepositories";

export class CreateShipment {
    constructor(private repo = new IShipmentRepository()) { }

    async execute(shipment: Shipment): Promise<void> {
        try {
            console.log("[CreateShipment] execute called with:", shipment);
            await this.repo.login();
            await this.repo.createShipment(shipment);
            console.log("[CreateShipment] Shipment created successfully.");
        } catch (error) {
            console.error("[CreateShipment] Error creating shipment:", error);
            throw error;
        }
    }
}
