import { ShipmentRepository } from "@/domain/repositories/shipmentRepository";

export class GetShipmentDetails {
    constructor(private repo = ShipmentRepository) { }

    async execute(awb: string): Promise<any> {
        try {
            // await this.repo.login();
            return await this.repo.getShipmentDetails(awb);
        } catch (error) {
            console.error("[GetShipmentDetails] Error fetching shipment details:", error);
            throw error;
        }
    }
}
