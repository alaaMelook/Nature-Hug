
// getShipmentPDF.ts
import { ShipmentRepository } from "@/domain/repositories/shipmentRepository";
export class GetShipmentPDF {
    constructor(private repo = ShipmentRepository) { }
    async execute(shipmentId: string) {
        return this.repo.getShipmentPDF(shipmentId);
    }
}
