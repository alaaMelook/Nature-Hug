import { NextResponse } from "next/server";
import { paymobService } from "@/lib/services/paymobService";
import { UpdateOrder } from "@/domain/use-case/admin/orders/updateOrder";
import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { PaymobTransactionData } from "@/domain/entities/paymob/transaction";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const data = Object.fromEntries(searchParams.entries());

        // Map flattened keys to what verifyHmac expects if necessary
        // Paymob callback params usually come as source_data.pan, etc.
        // My verifyHmac expects source_data_pan
        const hmacData: PaymobTransactionData = {
            ...data,
            source_data_pan: data["source_data.pan"],
            source_data_sub_type: data["source_data.sub_type"],
            source_data_type: data["source_data.type"],
        } as unknown as PaymobTransactionData;

        const isValid = paymobService.verifyHmac(hmacData);

        if (!isValid) {
            console.error("HMAC Validation Failed");
            return NextResponse.json({ error: "HMAC Validation Failed" }, { status: 400 });
        }

        const success = data.success === "true";
        const orderId = data.merchant_order_id;

        if (success) {
            // Update order status to processing (paid)
            const updateOrderUseCase = new UpdateOrder(new IAdminServerRepository());
            await updateOrderUseCase.execute({
                order_id: parseInt(orderId),
                order_status: 'processing' // or 'completed' depending on your flow
            } as any);

            // Redirect to success page
            return NextResponse.redirect(new URL(`/orders/${orderId}?payment_success=true`, request.url));
        } else {
            // Redirect to order page with error
            return NextResponse.redirect(new URL(`/orders/${orderId}?payment_failed=true`, request.url));
        }

    } catch (error: any) {
        console.error("Paymob Callback Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
