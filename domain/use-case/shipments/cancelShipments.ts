import { ShipmentRepository } from "@/domain/repositories/shipmentRepository";
export class CancelShipment {
    constructor(private repo = ShipmentRepository) { }
    async execute(shipmentId: string) {
        return this.repo.cancelShipment(shipmentId);
    }
}