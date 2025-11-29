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
        console.log("[ShipmentApi] Login attempt with:", {
            url: `${API_URL}/api/ClientUsers/V6/Login`,
            companyId: COMPANY_ID,
            username: username,
            passwordLength: password ? password.length : 0
        });

        const res = await fetch(`${API_URL}/api/ClientUsers/V6/Login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // No token needed for login
                "CompanyID": COMPANY_ID // CompanyID is still needed for login
            },
            body: JSON.stringify({ "username": username, "password": password }),

        });
        if (!res.ok) {
            const text = await res.text();
            console.error(`[ShipmentApi] Login failed: ${res.status} ${res.statusText}`, text);
            throw new Error(`Login failed : ${res.status} ${res.statusText} - ${text}`);
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

    async getShipmentDetails(token: string, awb: string) {
        const res = await fetch(`${API_URL}/api/ClientUsers/V6/GetShipmentDetails/${awb}`, {
            headers: this.authHeader(token),
        });
        if (!res.ok) throw new Error("Failed to get shipment details");
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

    async getShipmentHistory(token: string, fromDate: Date, toDate: Date) {
        const res = await fetch(`${API_URL}/api/ClientUsers/V6/GetShipmentsEx`, {
            method: "POST",
            headers: this.authHeader(token),
            body: JSON.stringify({
                fromDate: fromDate.toISOString(),
                toDate: toDate.toISOString()
            }),
        });
        if (!res.ok) {
            const text = await res.text();
            console.error(`[ShipmentApi] getShipmentHistory failed: ${res.status} ${res.statusText}`, text);
            throw new Error(`Failed to get shipment history: ${res.status} ${text}`);
        }
        return res.json();
    }
}
