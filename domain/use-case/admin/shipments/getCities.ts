import { City } from "@/domain/entities/shipment/city";
import { IShipmentRepository } from "@/data/repositories/iShipmentRepositories";

export class GetCities {
    constructor(private repo = new IShipmentRepository()) { }

    async execute(): Promise<City[]> {
        try {
            await this.repo.login();
            return await this.repo.getCities();
        } catch (error) {
            console.error("[GetCities] Error fetching cities:", error);
            throw error;
        }
    }
}
