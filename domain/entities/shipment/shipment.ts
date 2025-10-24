export interface Shipment {
    id?: string;
    clientName: string;
    cityId: number;
    address: string;
    phone: string;
    codAmount: number;
    weight: number;
    status?: string;
}
