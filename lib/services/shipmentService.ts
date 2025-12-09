import { Shipment, ShipmentDetails } from "@/domain/entities/shipment/shipment";
import { City } from "@/domain/entities/shipment/city";
import { ShipmentHistoryItem } from "@/domain/entities/shipment/shipmentHistoryItem";
import { ShipmentDetailsEx } from "@/domain/entities/shipment/shipmentDetailsEx";

const API_URL = process.env.NEXT_PUBLIC_VSOFT_API_URL!;
const COMPANY_ID = process.env.NEXT_PUBLIC_SHIPMENT_COMPANY_ID!;
const USERNAME = process.env.NEXT_PUBLIC_SHIPMENT_USERNAME!;
const PASSWORD = process.env.NEXT_PUBLIC_SHIPMENT_PASSWORD!;

class ShipmentService {
    private static instance: ShipmentService;
    private token: string | null = null;
    private powerBiLink: string | null = null;
    private testToken: string = "28EE5E0D-5BFF-4D31-8110-15BB511B0F9D";
    private testPowerBiLink: string = "https://app.powerbi.com/view?r=eyJrIjoiMDZiNDZkNjMtZTIyZS00NDM0LTgyYjMtMDAyZjMwZGRhZDE4IiwidCI6IjZkYWU4YTlkLTZmNDAtNDcxNC1iZmMxLTJiYWNhZTgwZjNjZCJ9";

    private constructor(test: boolean = false) {
        if (test) {
            this.token = this.testToken;
            this.powerBiLink = this.testPowerBiLink;
        }
    }

    public static getInstance(test: boolean = false): ShipmentService {
        if (!ShipmentService.instance) {
            ShipmentService.instance = new ShipmentService(test);
        }
        return ShipmentService.instance;
    }

    private async login(): Promise<void> {
        console.log("[ShipmentService] Logging in...");
        try {
            const res = await fetch(`${API_URL}/api/ClientUsers/V6/Login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "CompanyID": COMPANY_ID
                },
                body: JSON.stringify({ "userName": USERNAME, "password": PASSWORD }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Login failed: ${res.status} ${res.statusText} - ${text}`);
            }

            const data = await res.json();
            if (!data.AccessToken) {
                throw new Error("Login response missing AccessToken");
            }

            this.token = data.AccessToken;
            this.powerBiLink = data.DataAnalysisLink;
            console.log("[ShipmentService] Login successful");
        } catch (error) {
            console.error("[ShipmentService] Login error:", error);
            throw error;
        }
    }

    public async ensureAuth(): Promise<void> {
        console.log("[ShipmentService] Ensuring authentication...");
        if (!this.token) {
            console.log("[ShipmentService] Token is missing, logging in...");
            await this.login();
        }
        console.log("[ShipmentService] Authentication ensured");
    }

    private getAuthHeaders() {
        return {
            "AccessToken": `${this.token}`,
            "Content-Type": "application/json",
            "CompanyID": COMPANY_ID,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",

        };
    }

    private async request<T>(url: string, options: RequestInit = {}, retry = true,): Promise<T> {
        await this.ensureAuth();

        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers,
            }
        });

        if (response.status === 401 && retry) {
            console.warn("[ShipmentService] 401 Unauthorized, retrying login...");
            this.token = null; // Clear token
            await this.login(); // Re-login
            return this.request<T>(url, options, false); // Retry once
        }

        if (!response.ok) {
            const text = await response.text();
            console.log("[ShipmentService] sent body ", options.body);
            console.error(`[ShipmentService] Request failed: ${response.status} ${url}`, text);
            throw new Error(`API Error: ${response.status} ${text}`);
        }
        const text = await response.text();
        const json = JSON.parse(text);
        console.log("[ShipmentService] Request Json ", json);
        return json;
    }



    public async getShipmentHistory(fromDate: Date, toDate: Date): Promise<ShipmentHistoryItem[]> {
        return this.request<ShipmentHistoryItem[]>(`${API_URL}/api/ClientUsers/V6/GetShipmentsEx`, {
            method: "POST",
            body: JSON.stringify({
                fromDate: fromDate.toISOString(),
                toDate: toDate.toISOString()
            })
        });
    }

    public async getShipmentDetails(awb: string): Promise<ShipmentDetailsEx> {
        return this.request<ShipmentDetailsEx>(`${API_URL}/api/ClientUsers/V6/GetShipmentDetails/${awb}`);
    }

    public async createShipment(shipment: Shipment): Promise<ShipmentDetails> {
        const data = await this.request<ShipmentDetails[]>(`${API_URL}/api/ClientUsers/V6/SaveShipment`, {
            method: "POST",
            body: JSON.stringify(shipment)
        });
        return data[0];
    }

    public async getDashboardLink(): Promise<string | null> {
        await this.ensureAuth();
        return this.powerBiLink;
    }

    public async cancelShipment(awb: string): Promise<any> {
        return this.request(`${API_URL}/api/ClientUsers/V6/CancelShipment`, {
            method: "POST",
            body: JSON.stringify({ awb: awb, notes: "" })
        });
    }

    public async getShipmentPDF(shipmentId: string): Promise<Blob> {
        await this.ensureAuth();
        const response = await fetch(`${API_URL}/api/ClientUsers/V6/GetShipmentPDF/${shipmentId}`, {
            headers: this.getAuthHeaders()
        });
        if (!response.ok) throw new Error("Failed to fetch shipment PDF");
        return response.blob();
    }


}

export const shipmentService = ShipmentService.getInstance(true);
