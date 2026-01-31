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
                    "CompanyID": COMPANY_ID,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
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

    /**
     * Get shipment statistics from Aliens Express API
     * @param fromDate - Start date for filtering
     * @param toDate - End date for filtering
     * @param feesMap - Optional map of city names to shipping fees (for net payout calculation)
     */
    public async getShipmentStats(fromDate?: Date, toDate?: Date, feesMap?: Record<string, number>): Promise<ShipmentStats> {
        // Default to all time if no dates provided
        const from = fromDate || new Date('2020-01-01');
        const to = toDate || new Date();

        const shipments = await this.getShipmentHistory(from, to);

        // Calculate statistics
        const totalShipments = shipments.length;

        // Log unique statuses for debugging
        const uniqueStatuses = [...new Set(shipments.map(s => s.StatusNameE))];
        console.log("[ShipmentService] Unique statuses found:", uniqueStatuses);

        // Status counts based on StatusNameE from the API
        const statusCounts = {
            delivered: 0,
            heading: 0,    // Heading to Customer / Out for Delivery
            inProgress: 0, // In Progress / Picked up / In transit
            newOrders: 0,  // New / Pending Pickup
            returned: 0,   // Returned / RTS
            cancelled: 0,
            pendingReturn: 0,
            requireAttention: 0,
        };

        let totalCOD = 0;
        let collectedCOD = 0;
        let totalShippingFees = 0;
        let collectedShippingFees = 0;
        const unmatchedStatuses: string[] = [];

        for (const shipment of shipments) {
            const status = (shipment.StatusNameE || '').toLowerCase().trim();
            const cod = shipment.COD || 0;
            // Collected is "Yes"/"No" string, not a number!
            const isCollected = (shipment.Collected || '').toLowerCase() === 'yes';

            // Get shipping fee for this city
            const cityName = (shipment.ToCityName || '').toLowerCase();
            const shippingFee = feesMap ? (feesMap[cityName] || 0) : 0;

            totalCOD += cod;
            totalShippingFees += shippingFee;

            if (isCollected) {
                collectedCOD += cod;
                collectedShippingFees += shippingFee;
            }

            // Map Aliens Express status names to our categories
            if (status === 'delivered' || status === 'completed' || status.includes('delivered')) {
                statusCounts.delivered++;
            } else if (status === 'with courier' || status === 'delivering' || status === 'out for delivery' ||
                status.includes('heading') || status.includes('courier') || status.includes('delivering')) {
                statusCounts.heading++;
            } else if (status === 'picked up' || status === 'in transit' || status === 'in progress' ||
                status.includes('transit') || status.includes('progress') || status === 'picked up') {
                statusCounts.inProgress++;
            } else if (status === 'online pickup' || status === 'new' || status === 'pending pickup' ||
                status === 'pending' || status.includes('online pickup') || status.includes('new order')) {
                statusCounts.newOrders++;
            } else if (status === 'returned' || status === 'rts' || status === 'returned to shipper' ||
                status.includes('returned') || status.includes('rts')) {
                statusCounts.returned++;
            } else if (status === 'cancelled' || status === 'canceled' || status.includes('cancel')) {
                statusCounts.cancelled++;
            } else if (status.includes('pending return') || status.includes('return pending')) {
                statusCounts.pendingReturn++;
            } else if (status.includes('attention') || status.includes('failed') || status.includes('exception')) {
                statusCounts.requireAttention++;
            } else {
                // Track unmatched statuses
                if (!unmatchedStatuses.includes(status)) {
                    unmatchedStatuses.push(status);
                }
            }
        }

        if (unmatchedStatuses.length > 0) {
            console.log("[ShipmentService] Unmatched statuses:", unmatchedStatuses);
        }

        // Calculate rates
        const successRate = totalShipments > 0
            ? ((statusCounts.delivered / totalShipments) * 100).toFixed(1)
            : '0';
        const returnRate = totalShipments > 0
            ? ((statusCounts.returned / totalShipments) * 100).toFixed(1)
            : '0';

        // Calculate average delivery time (days) from delivered shipments
        let avgDeliveryTime = 0;
        const deliveredShipments = shipments.filter(s =>
            (s.StatusNameE || '').toLowerCase().includes('delivered') && s.DeliveryDate && s.PickupDate
        );

        if (deliveredShipments.length > 0) {
            let totalDays = 0;
            for (const ship of deliveredShipments) {
                const pickup = new Date(ship.PickupDate);
                const delivery = new Date(ship.DeliveryDate);
                const diffDays = (delivery.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24);
                if (diffDays > 0) totalDays += diffDays;
            }
            avgDeliveryTime = Math.round(totalDays / deliveredShipments.length);
        }

        // Calculate NET amounts after deducting shipping fees
        const netCollected = collectedCOD - collectedShippingFees;
        const netPending = (totalCOD - collectedCOD) - (totalShippingFees - collectedShippingFees);

        const inTransit = statusCounts.heading + statusCounts.inProgress;
        const pending = statusCounts.newOrders + statusCounts.requireAttention;

        console.log("[ShipmentService] Stats calculated:", {
            totalShipments,
            delivered: statusCounts.delivered,
            heading: statusCounts.heading,
            inProgress: statusCounts.inProgress,
            newOrders: statusCounts.newOrders,
            returned: statusCounts.returned,
            cancelled: statusCounts.cancelled,
            totalCOD,
            collectedCOD,
            totalShippingFees,
            collectedShippingFees,
            netCollected,
            netPending
        });

        return {
            totalOrders: totalShipments,
            totalShipments,
            delivered: statusCounts.delivered,
            cancelled: statusCounts.cancelled,
            returned: statusCounts.returned,
            pending,
            inTransit,
            successRate: parseFloat(successRate),
            failureRate: parseFloat(returnRate),
            avgDeliveryTime,
            totalCOD: Math.round(totalCOD),
            collectedCOD: Math.round(netCollected), // NET collected after shipping fees
            pendingCOD: Math.round(netPending > 0 ? netPending : 0), // NET pending after shipping fees
            statusBreakdown: [
                { name: 'Delivered', value: statusCounts.delivered, color: '#22c55e' },
                { name: 'In Transit', value: inTransit, color: '#3b82f6' },
                { name: 'Pending', value: pending, color: '#f59e0b' },
                { name: 'Cancelled', value: statusCounts.cancelled, color: '#ef4444' },
                { name: 'Returned', value: statusCounts.returned, color: '#8b5cf6' },
            ]
        };
    }

}

export interface ShipmentStats {
    totalOrders: number;
    totalShipments: number;
    delivered: number;
    cancelled: number;
    returned: number;
    pending: number;
    inTransit: number;
    successRate: number;
    failureRate: number;
    avgDeliveryTime: number;
    totalCOD: number;
    collectedCOD: number;
    pendingCOD: number;
    statusBreakdown: { name: string; value: number; color: string }[];
}

export const shipmentService = ShipmentService.getInstance();
