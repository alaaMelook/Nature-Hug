// uploadExcelFile.ts
import { ShipmentRepository } from "@/domain/repositories/shipmentRepository";
export class GetDashboardLink {
    constructor(private repo = ShipmentRepository) { }
    async execute() {
        try {
            console.log("[GetDashboardLink] execute called.");
            const result = await this.repo.getPowerBiLink();
            console.log("[GetDashboardLink] getPowerBiLink result:", result);
            return result;
        } catch (error) {
            console.error("[GetDashboardLink] Error in execute:", error);
            throw error;
        }
    }
}