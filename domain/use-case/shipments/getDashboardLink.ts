// uploadExcelFile.ts
import {ShipmentRepository} from "@/domain/repositories/shipmentRepository";

export class GetDashboardLink {
    constructor(private repo = ShipmentRepository) {
    }

    execute() {
        try {
            console.log("[GetDashboardLink] execute called.");
            const result = this.repo.getPowerBiLink();
            console.log("[GetDashboardLink] getPowerBiLink result:", result);
            return result;
        } catch (error) {
            console.error("[GetDashboardLink] Error in execute:", error);
            throw error;
        }
    }
}