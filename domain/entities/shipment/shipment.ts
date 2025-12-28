export interface Shipment {
    id?: string;
    clientName?: string;
    fromAddress?: string;
    toCityName?: string;
    toAddress: string;
    toConsigneeName: string;
    toCityID: number;  // Changed from toCityId to match API
    subAccountName?: string;
    clientAccNo?: number;
    toPhone: string;
    toMobile: string;
    cod: number;  // Changed from codAmount to match API
    pieces: number;
    fromCityID: number;
    status?: string;
    specialInstuctions?: string;  // Changed from shipperNotes to match API
    toRef?: string;
    productID?: number;
    weight?: number;
    contents?: string;
}
export interface ShipmentDetails {
    serial: number,
    sessionID: number,
    userID: number,
    clientID: number,
    subAccountID: number,
    awb: string,
    fromCityID: number,
    fromAddress: string,
    fromPhone: string,
    fromContactPerson: string,
    toCityID: number,
    toConsigneeName: string,
    toAddress: string,
    toPhone: string,
    toMobile: string,
    toRef: string,
    toContactPerson: string,
    productID: number,
    coD: number,
    weight: number,
    pieces: number,
    contents: string,
    specialInstuctions: string,
    data1: string,
    data2: string,
    data3: string,
    data4: string,
    data5: string,
    data6: string,
    data7: string,
    data8: string,
    data9: string,
    data10: string,
    transDate: string,
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    distance: number,
    duration: number,
    route: string,
    pickupID: number,
    allowToOpenShipment: boolean,
    awBxAWB: boolean
}