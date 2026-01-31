import { NextResponse } from "next/server";
import { shipmentService } from "@/lib/services/shipmentService";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Parse dates
        const fromDate = startDate ? new Date(startDate) : undefined;
        const toDate = endDate ? new Date(endDate) : undefined;

        // Get stats directly from Aliens Express API
        const stats = await shipmentService.getShipmentStats(fromDate, toDate);

        return NextResponse.json({
            success: true,
            stats
        });
    } catch (error: any) {
        console.error("[Shipment Stats API] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
