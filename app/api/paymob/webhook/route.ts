import { NextResponse } from "next/server";
import { paymobService } from "@/lib/services/paymobService";
import { UpdateOrder } from "@/domain/use-case/admin/orders/updateOrder";
import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { PaymobTransactionData } from "@/domain/entities/paymob/transaction";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { obj } = data; // Paymob webhook payload is wrapped in 'obj'

        if (!obj) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // Map nested keys to what verifyHmac expects
        const hmacData: PaymobTransactionData = {
            ...obj,
            source_data_pan: obj.source_data?.pan,
            source_data_sub_type: obj.source_data?.sub_type,
            source_data_type: obj.source_data?.type,
        } as unknown as PaymobTransactionData;

        const isValid = paymobService.verifyHmac(hmacData);

        if (!isValid) {
            console.error("HMAC Validation Failed");
            return NextResponse.json({ error: "HMAC Validation Failed" }, { status: 400 });
        }

        const success = obj.success === true;
        const orderId = obj.merchant_order_id;

        if (success) {
            // Update order status to processing (paid)
            const updateOrderUseCase = new UpdateOrder(new IAdminServerRepository());
            await updateOrderUseCase.execute({
                order_id: parseInt(orderId),
                order_status: 'processing'
            } as any);
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error("Paymob Webhook Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
