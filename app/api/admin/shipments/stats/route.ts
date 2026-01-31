import { NextResponse } from "next/server";
import { shipmentService } from "@/lib/services/shipmentService";
import { supabaseAdmin } from "@/data/datasources/supabase/admin";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Parse dates
        const fromDate = startDate ? new Date(startDate) : undefined;
        const toDate = endDate ? new Date(endDate) : undefined;

        // Fetch governorate fees from database
        const { data: governorates } = await supabaseAdmin
            .schema('store')
            .from('governorates')
            .select('name_en, name_ar, fees');

        // Create a map of city name (English) to fees
        // The API returns ToCityName which matches our name_en
        const feesMap: Record<string, number> = {};
        (governorates || []).forEach(gov => {
            if (gov.name_en) {
                feesMap[gov.name_en.toLowerCase()] = gov.fees || 0;
            }
        });

        // Get stats directly from Aliens Express API
        const stats = await shipmentService.getShipmentStats(fromDate, toDate, feesMap);

        return NextResponse.json({
            success: true,
            stats
        });
    } catch (error: any) {
        console.error("[Shipment Stats API] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
