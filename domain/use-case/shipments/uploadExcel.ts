// uploadExcelFile.ts
import { ShipmentRepository } from "@/domain/repositories/shipmentRepository";
export class UploadExcelFile {
    constructor(private repo = ShipmentRepository) { }
    async execute(file: File) {
        return this.repo.uploadExcelFile(file);
    }
}
