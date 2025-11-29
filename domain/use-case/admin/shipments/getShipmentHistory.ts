import { ShipmentRepository } from "@/domain/repositories/shipmentRepository";

export class GetShipmentHistory {
    constructor(private repo = ShipmentRepository) { }

    async execute(fromDate: Date, toDate: Date): Promise<any> {
        try {
            return await this.repo.getShipmentHistory(fromDate, toDate);
        } catch (error) {
            console.error("[GetShipmentHistory] Error fetching history:", error);
            throw error;
        }
    }
}
