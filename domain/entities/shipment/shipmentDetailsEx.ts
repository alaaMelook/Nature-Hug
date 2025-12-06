export interface ShipmentInfo {
    AWB: string;
    ConsigneeName: string;
    Address: string;
    Phone1: string;
    Phone2: string;
    Phone3: string;
    Ref: string;
    SpecialInstruction: string;
    StatusName: string;
    Reason: string;
    Recipient: string;
    RecipientName: string;
    Weight: number;
    Pcs: string;
    Contents: string;
    COD: number;
    FromCity: string;
    ToCity: string;
    Product: string;
    PickupDate: string;
    Data1: string;
    Data2: string;
    Data3: string;
    Data4: string;
    Data5: string;
    Data6: string;
    Data7: string;
    Data8: string;
    Data9: string;
    Data10: string;
    IDNO: string;
    RunnerName: string;
    RunnerMobile: string;
    UpdateNotes: string;
    CurrentBranch: string;
    FromBranch: string;
    ToBranch: string;
    ExpectedDeliveryDate: string;
    StatusID: number;
    IsReversed: boolean;
    ReverseAWB: string;
}

export interface TrackingEvent {
    AuditDate: string;
    StatusID: number;
    StatusDescription: string;
    StatusName: string;
    Reason: string;
    Recipient: string;
    RecipientName: string;
    UpdateNotes: string;
    VisitLat: number;
    VisitLon: number;
    GeoLocation: string;
    Region: string;
    Country: string;
    City: string;
}

export interface ShipmentDetailsEx {
    shipmentInfo: ShipmentInfo[];
    tracking: TrackingEvent[];
    awBsByRef: any[]; // Use specific type if known, otherwise any[]
    calls: any[];
    complaints: any[];
    complaintsActions: any[];
}
