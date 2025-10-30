// getShipmentPDF.ts
import { ShipmentRepository } from "@/domain/repositories/shipmentRepository";
export class GetShipmentPDF {
    constructor(private repo = ShipmentRepository) { }
    async execute(shipmentId: string) {
        try {
            console.log("[GetShipmentPDF] execute called with shipmentId:", shipmentId);
            const result = await this.repo.getShipmentPDF(shipmentId);
            console.log("[GetShipmentPDF] getShipmentPDF result:", result);
            return result;
        } catch (error) {
            console.error("[GetShipmentPDF] Error in execute:", error);
            throw error;
        }
    }
}
