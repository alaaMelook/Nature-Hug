import { IAdminClientRepository } from "@/data/repositories/client/iAdminRepository";
import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { Shipment } from "@/domain/entities/shipment/shipment";
import { ShipmentDetailsEx } from "@/domain/entities/shipment/shipmentDetailsEx";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { UpdateOrder } from "@/domain/use-case/admin/orders/updateOrder";
import { shipmentService } from "@/lib/services/shipmentService";

export async function createShipmentAction(order: OrderDetailsView, shipment: Shipment, governorate: string) {
    if (governorate.toLowerCase().includes("damanhour") || governorate.toLowerCase().includes("دمنهور")) {
        console.log("Skipping shipment creation for Damanhour");
        return { success: true, skipped: true };
    }

    try {
        const result = await shipmentService.createShipment(shipment);

        // Handle array response from API
        let awb = null;
        if (Array.isArray(result) && result.length > 0) {
            awb = result[0].awb;
        } else if (result && result.awb) {
            awb = result.awb;
        }

        if (awb) {
            console.log(`Shipment created with AWB: ${awb}`);
            await new IAdminClientRepository().updateOrder({ ...order, awb });
        }

        return { success: true, data: result };
    } catch (error) {
        console.error("Failed to create shipment:", error);
        return { success: false, error: "Failed to create shipment" };
    }
}

export async function getCitiesAction() {
    try {
        const cities = await shipmentService.getCities();
        return { success: true, cities };
    } catch (error) {
        console.error("Failed to fetch cities:", error);
        return { success: false, error: "Failed to fetch cities" };
    }
}

export async function getShipmentDetailsAction(awb: string) {
    try {
        const result = await shipmentService.getShipmentDetails(awb);
        return { success: true, data: result as ShipmentDetailsEx | null };
    } catch (error) {
        console.error("Failed to fetch shipment details:", error);
        return { success: false, error: "Failed to fetch shipment details" };
    }
}

export async function getShipmentHistoryAction(fromDate: Date, toDate: Date) {
    try {
        const result = await shipmentService.getShipmentHistory(fromDate, toDate);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: "Failed to fetch shipment history" };
    }
}

export async function getDashboardLinkAction() {
    try {
        const link = await shipmentService.getDashboardLink();
        return { success: true, link };
    } catch (error) {
        console.error("Failed to get dashboard link:", error);
        return { success: false, error: "Failed to get dashboard link" };
    }
}
