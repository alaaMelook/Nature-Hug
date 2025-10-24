// uploadExcelFile.ts
import { ShipmentRepository } from "@/domain/repositories/shipmentRepository";
export class GetDashboardLink {
    constructor(private repo = ShipmentRepository) { }
    execute() {
        return this.repo.getPowerBiLink();
    }
}