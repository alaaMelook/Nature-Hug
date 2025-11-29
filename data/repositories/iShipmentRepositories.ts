import { City } from "@/domain/entities/shipment/city";
import { Shipment } from "@/domain/entities/shipment/shipment";
import { ShipmentProduct } from "@/domain/entities/shipment/shipmentProduct";
import { ShipmentApi } from "../datasources/api/shipmentAPI";
import { ShipmentRepositoryAbstract } from "@/domain/repositories/shipmentRepository";


export class IShipmentRepository implements ShipmentRepositoryAbstract {
    private api: ShipmentApi;
    private token: string | null = null;
    private testToken: string = '28EE5E0D-5BFF-4D31-8110-15BB511B0F9D';
    private powerBiLink: string | null = null;

    constructor() {
        this.api = new ShipmentApi();
    }

    async login(): Promise<{ token: string, powerBiLink: string | null }> {
        console.log("[IShipmentRepository] login called.");
        const data = await this.api.login();
        console.log("[IShipmentRepository] login result:", data);
        if (!data.AccessToken) throw new Error("Login failed");

        this.token = data.AccessToken;
        this.powerBiLink = data.DataAnalysisLink;
        return { token: this.token!, powerBiLink: this.powerBiLink };
    }

    async createShipment(data: Shipment): Promise<any> {

        console.log("[IShipmentRepository] createShipment called with data:", data);
        if (!this.token) {
            const { token, powerBiLink } = await this.login();
            this.token = token;
            this.powerBiLink = powerBiLink;
        };
        const result = await this.api.createShipment(this.testToken, data);
        console.log("[IShipmentRepository] createShipment result:", result);
        return result;

    }

    async getCities(): Promise<City[]> {

        console.log("[IShipmentRepository] getCities called.");
        if (!this.token) {
            const { token, powerBiLink } = await this.login();
            this.token = token;
            this.powerBiLink = powerBiLink;
        };
        const result = await this.api.getCities(this.token);
        console.log("[IShipmentRepository] getCities result:", result);
        return result;

    }

    async getProducts(): Promise<ShipmentProduct[]> {

        console.log("[IShipmentRepository] getProducts called.");
        if (!this.token) {
            const { token, powerBiLink } = await this.login();
            this.token = token;
            this.powerBiLink = powerBiLink;
        };
        const result = await this.api.getProducts(this.token);
        console.log("[IShipmentRepository] getProducts result:", result);
        return result;

    }

    async getShipmentDetails(awb: string): Promise<any> {
        console.log("[IShipmentRepository] getShipmentDetails called with awb:", awb);
        if (!this.token) {
            const { token, powerBiLink } = await this.login();
            this.token = token;
            this.powerBiLink = powerBiLink;
        };
        const result = await this.api.getShipmentDetails(this.token, awb);
        console.log("[IShipmentRepository] getShipmentDetails result:", result);
        return result;
    }

    async cancelShipment(shipmentId: string): Promise<any> {

        console.log("[IShipmentRepository] cancelShipment called with shipmentId:", shipmentId);
        if (!this.token) {
            const { token, powerBiLink } = await this.login();
            this.token = token;
            this.powerBiLink = powerBiLink;
        };
        const result = await this.api.cancelShipment(this.token, shipmentId);
        console.log("[IShipmentRepository] cancelShipment result:", result);
        return result;

    }

    async getShipmentPDF(shipmentId: string): Promise<any> {

        console.log("[IShipmentRepository] getShipmentPDF called with shipmentId:", shipmentId);
        if (!this.token) {
            const { token, powerBiLink } = await this.login();
            this.token = token;
            this.powerBiLink = powerBiLink;
        };
        const result = await this.api.getShipmentPDF(this.token, shipmentId);
        console.log("[IShipmentRepository] getShipmentPDF result:", result);
        return result;

    }

    async uploadExcelFile(file: File): Promise<Blob> {

        console.log("[IShipmentRepository] uploadExcelFile called with file:", file);
        if (!this.token) {
            const { token, powerBiLink } = await this.login();
            this.token = token;
            this.powerBiLink = powerBiLink;
        };
        const result = await this.api.uploadExcelFile(this.testToken, file);
        console.log("[IShipmentRepository] uploadExcelFile result:", result);
        return result;

    }

    getPowerBiLink(): string | null {
        return this.powerBiLink;
    }

    isSessionValid(): boolean {
        return !!this.token;
    }

    async getShipmentHistory(fromDate: Date, toDate: Date): Promise<any> {
        console.log("[IShipmentRepository] getShipmentHistory called with dates:", fromDate, toDate);
        if (!this.token) {
            const { token } = await this.login();
            this.token = token;
        };
        const result = await this.api.getShipmentHistory(this.token, fromDate, toDate);
        console.log("[IShipmentRepository] getShipmentHistory result:", result);
        return result;
    }
}
