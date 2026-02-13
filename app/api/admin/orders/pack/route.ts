import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST: Mark orders as packed and deduct packaging materials
export async function POST(request: Request) {
    try {
        const { orderIds } = await request.json();

        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return NextResponse.json({ error: "orderIds array required" }, { status: 400 });
        }

        const results: { orderId: number; success: boolean; error?: string }[] = [];

        for (const orderId of orderIds) {
            try {
                // 1. Deduct packaging materials
                const { deductPackagingForOrder } = await import("@/lib/services/stockService");
                await deductPackagingForOrder(orderId);

                // 2. Mark order as packed
                const { error } = await supabaseAdmin
                    .schema('store')
                    .from('orders')
                    .update({ packed: true })
                    .eq('id', orderId);

                if (error) {
                    console.error(`[PackAPI] Error marking order ${orderId} as packed:`, error);
                    results.push({ orderId, success: false, error: error.message });
                } else {
                    results.push({ orderId, success: true });
                }
            } catch (err: any) {
                console.error(`[PackAPI] Error packing order ${orderId}:`, err);
                results.push({ orderId, success: false, error: err.message });
            }
        }

        const successCount = results.filter(r => r.success).length;
        return NextResponse.json({
            message: `${successCount}/${orderIds.length} orders packed successfully`,
            results
        });
    } catch (error: any) {
        console.error("[PackAPI] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
