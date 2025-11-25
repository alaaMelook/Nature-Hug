'use server'

import { UpdateOrder } from "@/domain/use-case/admin/orders/updateOrder";
import { CreateShipment } from "@/domain/use-case/admin/shipments/createShipment";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { Shipment } from "@/domain/entities/shipment/shipment";

export async function updateOrderAction(order: OrderDetailsView) {
    try {
        await new UpdateOrder().execute(order);
        return { success: true };
    } catch (error) {
        console.error("Failed to update order:", error);
        return { success: false, error: "Failed to update order" };
    }
}

export async function createShipmentAction(shipment: Shipment, governorate: string) {
    if (governorate.toLowerCase().includes("damanhour") || governorate.toLowerCase().includes("دمنهور")) {
        console.log("Skipping shipment creation for Damanhour");
        return { success: true, skipped: true };
    }

    try {
        await new CreateShipment().execute(shipment);
        return { success: true };
    } catch (error) {
        console.error("Failed to create shipment:", error);
        return { success: false, error: "Failed to create shipment" };
    }
}

import { GetCities } from "@/domain/use-case/admin/shipments/getCities";

export async function getCitiesAction() {
    try {
        const cities = await new GetCities().execute();
        return { success: true, cities };
    } catch (error) {
        console.error("Failed to fetch cities:", error);
        return { success: false, error: "Failed to fetch cities" };
    }
}
