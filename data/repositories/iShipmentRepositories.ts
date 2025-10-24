import { City } from "@/domain/entities/shipment/city";
import { Shipment } from "@/domain/entities/shipment/shipment";
import { ShipmentProduct } from "@/domain/entities/shipment/shipmentProduct";
import { ShipmentApi } from "../datasources/api/shipmentAPI";
import { ShipmentRepositoryAbstract } from "@/domain/repositories/shipmentRepository";


export class IShipmentRepository implements ShipmentRepositoryAbstract {
    private api: ShipmentApi;
    private token: string | null = null;
    private powerBiLink: string | null = null;

    constructor() {
        this.api = new ShipmentApi();
    }

    async login(): Promise<{ token: string, powerBiLink: string | null }> {
        const data = await this.api.login();
        console.log(data);
        if (!data.AccessToken) throw new Error("Login failed");
        this.token = data.AccessToken;
        this.powerBiLink = data.DataAnalysisLink;
        return { token: data.AccessToken, powerBiLink: this.powerBiLink };
    }

    async createShipment(data: Shipment): Promise<any> {
        if (!this.token) throw new Error("Not authenticated");
        return this.api.createShipment(this.token, data);
    }

    async getCities(): Promise<City[]> {
        if (!this.token) throw new Error("Not authenticated");
        return this.api.getCities(this.token);
    }

    async getProducts(): Promise<ShipmentProduct[]> {
        if (!this.token) throw new Error("Not authenticated");
        return this.api.getProducts(this.token);
    }

    async cancelShipment(shipmentId: string): Promise<any> {
        if (!this.token) throw new Error("Not authenticated");
        return this.api.cancelShipment(this.token, shipmentId);
    }

    async getShipmentPDF(shipmentId: string): Promise<any> {
        if (!this.token) throw new Error("Not authenticated");
        return this.api.getShipmentPDF(this.token, shipmentId);
    }

    async uploadExcelFile(file: File): Promise<Blob> {
        if (!this.token) throw new Error("Not authenticated");
        return this.api.uploadExcelFile(this.token, file);
    }

    getPowerBiLink(): string | null {
        return this.powerBiLink;
    }
    isSessionValid(): boolean {
        return !!this.token;
    }
}

