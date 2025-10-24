const API_URL = process.env.NEXT_PUBLIC_VSOFT_API_URL!;
const COMPANY_ID = process.env.NEXT_PUBLIC_SHIPMENT_COMPANY_ID!;
const username = process.env.NEXT_PUBLIC_SHIPMENT_USERNAME!;
const password = process.env.NEXT_PUBLIC_SHIPMENT_PASSWORD!;


export class ShipmentApi {
    private authHeader(token: string) {
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "CompanyID": COMPANY_ID
        };
    }

    async login() {
        const res = await fetch(`${API_URL}/api/ClientUsers/V6/Login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // No token needed for login
                "CompanyID": COMPANY_ID // CompanyID is still needed for login
            },
            body: JSON.stringify({ "username": username, "password": password }),

        });
        console.log(JSON.stringify({ "username": username, "password": password }));
        console.log({ "username": username, "password": password, "companyID": COMPANY_ID });
        if (!res.ok) {
            console.error("Login failed:", res.statusText);
            throw new Error("Login failed : " + res.statusText);
        }
        return res.json();
    }

    async getCities(token: string) {
        const res = await fetch(`${API_URL}/api/ClientUsers/V6/GetCities`, {
            headers: this.authHeader(token),
        });
        if (!res.ok) throw new Error("Failed to get cities");
        return res.json();
    }

    async getProducts(token: string) {
        const res = await fetch(`${API_URL}/api/ClientUsers/V6/GetProducts`, {
            headers: this.authHeader(token),
        });
        if (!res.ok) throw new Error("Failed to get products");
        return res.json();
    }

    async createShipment(token: string, shipmentData: any) {
        const res = await fetch(`${API_URL}/api/ClientUsers/V6/SaveShipment`, {
            method: "POST",
            headers: this.authHeader(token), // CompanyID is now in authHeader
            body: JSON.stringify(shipmentData),
        });
        if (!res.ok) throw new Error("Failed to create shipment");
        return res.json();
    }

    async cancelShipment(token: string, shipmentId: string) {
        const res = await fetch(`${API_URL}/api/ClientUsers/V6/CancelShipment`, {
            method: "POST",
            headers: this.authHeader(token), // CompanyID is now in authHeader
            body: JSON.stringify({ ShipmentNumber: shipmentId }),
        });
        if (!res.ok) throw new Error("Failed to cancel shipment");
        return res.json();
    }

    async getShipmentPDF(token: string, shipmentId: string) {
        const res = await fetch(`${API_URL}/api/ClientUsers/V6/GetShipmentPDF/${shipmentId}`, {
            headers: this.authHeader(token),
        });
        if (!res.ok) throw new Error("Failed to fetch shipment PDF");
        return await res.blob();
    }

    async uploadExcelFile(token: string, file: File) {
        const formData = new FormData();
        formData.append("file", file);
        // CompanyId is now in authHeader, no need to append to formData

        const res = await fetch(`${API_URL}/api/ClientUsers/V6/UploadExcelFile`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        if (!res.ok) throw new Error("Failed to upload Excel file");
        return res.json();
    }
}
