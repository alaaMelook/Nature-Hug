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
        try {
            console.log("[IShipmentRepository] login called.");
            const data = await this.api.login();
            console.log("[IShipmentRepository] login result:", data);
            if (!data.AccessToken) throw new Error("Login failed");
            this.token = data.AccessToken;
            this.powerBiLink = data.DataAnalysisLink;
            return { token: data.AccessToken, powerBiLink: this.powerBiLink };
        } catch (error) {
            console.error("[IShipmentRepository] Error in login:", error);
            throw error;
        }
    }

    async createShipment(data: Shipment): Promise<any> {
        try {
            console.log("[IShipmentRepository] createShipment called with data:", data);
            if (!this.token) throw new Error("Not authenticated");
            const result = await this.api.createShipment(this.token, data);
            console.log("[IShipmentRepository] createShipment result:", result);
            return result;
        } catch (error) {
            console.error("[IShipmentRepository] Error in createShipment:", error);
            throw error;
        }
    }

    async getCities(): Promise<City[]> {
        try {
            console.log("[IShipmentRepository] getCities called.");
            if (!this.token) throw new Error("Not authenticated");
            const result = await this.api.getCities(this.token);
            console.log("[IShipmentRepository] getCities result:", result);
            return result;
        } catch (error) {
            console.error("[IShipmentRepository] Error in getCities:", error);
            throw error;
        }
    }

    async getProducts(): Promise<ShipmentProduct[]> {
        try {
            console.log("[IShipmentRepository] getProducts called.");
            if (!this.token) throw new Error("Not authenticated");
            const result = await this.api.getProducts(this.token);
            console.log("[IShipmentRepository] getProducts result:", result);
            return result;
        } catch (error) {
            console.error("[IShipmentRepository] Error in getProducts:", error);
            throw error;
        }
    }

    async cancelShipment(shipmentId: string): Promise<any> {
        try {
            console.log("[IShipmentRepository] cancelShipment called with shipmentId:", shipmentId);
            if (!this.token) throw new Error("Not authenticated");
            const result = await this.api.cancelShipment(this.token, shipmentId);
            console.log("[IShipmentRepository] cancelShipment result:", result);
            return result;
        } catch (error) {
            console.error("[IShipmentRepository] Error in cancelShipment:", error);
            throw error;
        }
    }

    async getShipmentPDF(shipmentId: string): Promise<any> {
        try {
            console.log("[IShipmentRepository] getShipmentPDF called with shipmentId:", shipmentId);
            if (!this.token) throw new Error("Not authenticated");
            const result = await this.api.getShipmentPDF(this.token, shipmentId);
            console.log("[IShipmentRepository] getShipmentPDF result:", result);
            return result;
        } catch (error) {
            console.error("[IShipmentRepository] Error in getShipmentPDF:", error);
            throw error;
        }
    }

    async uploadExcelFile(file: File): Promise<Blob> {
        try {
            console.log("[IShipmentRepository] uploadExcelFile called with file:", file);
            if (!this.token) throw new Error("Not authenticated");
            const result = await this.api.uploadExcelFile(this.token, file);
            console.log("[IShipmentRepository] uploadExcelFile result:", result);
            return result;
        } catch (error) {
            console.error("[IShipmentRepository] Error in uploadExcelFile:", error);
            throw error;
        }
    }

    getPowerBiLink(): string | null {
        return this.powerBiLink;
    }
    isSessionValid(): boolean {
        return !!this.token;
    }
}
