// uploadExcelFile.ts
import { ShipmentRepository } from "@/domain/repositories/shipmentRepository";
export class Login {
    constructor(private repo = ShipmentRepository) { }
    async execute() {
        if (this.repo.isSessionValid()) {
            return;
        }
        else {
            return this.repo.login();
        }
    }
}
