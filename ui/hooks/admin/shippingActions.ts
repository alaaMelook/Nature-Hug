"use server";

import { IAdminClientRepository } from "@/data/repositories/client/iAdminRepository";
import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { Shipment } from "@/domain/entities/shipment/shipment";
import { ShipmentDetailsEx } from "@/domain/entities/shipment/shipmentDetailsEx";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { UpdateOrder } from "@/domain/use-case/admin/orders/updateOrder";
import { shipmentService } from "@/lib/services/shipmentService";

export async function createShipmentAction(order: OrderDetailsView, shipment: Shipment) {

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
            await new IAdminServerRepository().updateOrder({ ...order, awb });
        }

        return { success: true, data: result };
    } catch (error) {
        console.error("Failed to create shipment:", error);
        return { success: false, error: "Failed to create shipment" };
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

export async function getGovernoratesAction() {
    try {
        const governorates = await new IAdminServerRepository().getAllGovernorates();
        return { success: true, data: governorates };
    } catch (error) {
        console.error("Failed to fetch governorates:", error);
        return { success: false, error: "Failed to fetch governorates" };
    }
}

export async function updateGovernorateFeesAction(slug: string, fees: number) {
    try {
        await new IAdminServerRepository().updateGovernorateFees(slug, fees);
        return { success: true };
    } catch (error) {
        console.error("Failed to update governorate fees:", error);
        return { success: false, error: "Failed to update governorate fees" };
    }
}
