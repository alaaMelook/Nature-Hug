import { IShipmentRepository } from "@/data/repositories/iShipmentRepositories";
import { City } from "../entities/shipment/city";
import { Shipment } from "../entities/shipment/shipment";
import { ShipmentProduct } from "../entities/shipment/shipmentProduct";

export interface ShipmentRepositoryAbstract {
    login(): Promise<{ token: string, powerBiLink: string | null }>;
    createShipment(data: Shipment): Promise<any>;
    getCities(): Promise<City[]>;
    getProducts(): Promise<ShipmentProduct[]>;
    cancelShipment(shipmentId: string): Promise<any>;
    getShipmentPDF(shipmentId: string): Promise<any>;
    uploadExcelFile(file: File): Promise<Blob>;
    getPowerBiLink(): string | null;
    isSessionValid(): boolean;
}

export const ShipmentRepository: ShipmentRepositoryAbstract = new IShipmentRepository();