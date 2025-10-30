import { ShipmentRepository } from "@/domain/repositories/shipmentRepository";
export class CancelShipment {
    constructor(private repo = ShipmentRepository) { }
    async execute(shipmentId: string) {
        try {
            console.log("[CancelShipment] execute called with shipmentId:", shipmentId);
            const result = await this.repo.cancelShipment(shipmentId);
            console.log("[CancelShipment] cancelShipment result:", result);
            return result;
        } catch (error) {
            console.error("[CancelShipment] Error in execute:", error);
            throw error;
        }
    }
}