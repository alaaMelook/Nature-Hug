'use server';

import { paymobService } from "@/lib/services/paymobService";
import { PaymobBillingData } from "@/domain/entities/paymob/paymentKey";

export async function initiatePaymobPayment(
    orderId: number,
    amount: number,
    user: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
    },
    billingData: {
        street: string;
        city: string;
        country: string;
        state: string;
        apartment?: string;
        floor?: string;
        building?: string;
        postal_code?: string;
    }
) {
    try {
        if (!orderId || !amount || !user) {
            return { error: "Missing required fields" };
        }

        // 1. Authenticate
        const authToken = await paymobService.authenticate();

        // 2. Register Order
        // Amount in cents
        const amountCents = Math.round(amount * 100);
        const paymobOrderId = await paymobService.registerOrder(authToken, amountCents, orderId.toString());

        // 3. Request Payment Key
        // Ensure billing data has all required fields
        const finalBillingData: PaymobBillingData = {
            apartment: billingData?.apartment || "NA",
            email: user.email || "na@na.com",
            floor: billingData?.floor || "NA",
            first_name: user.first_name || "NA",
            street: billingData?.street || "NA",
            building: billingData?.building || "NA",
            phone_number: user.phone || "NA",
            shipping_method: "NA",
            postal_code: billingData?.postal_code || "NA",
            city: billingData?.city || "NA",
            country: billingData?.country || "EG",
            last_name: user.last_name || "NA",
            state: billingData?.state || "NA",
        };

        const paymentToken = await paymobService.requestPaymentKey(authToken, paymobOrderId, amountCents, finalBillingData);

        // 4. Get Iframe URL
        const iframeUrl = paymobService.getIframeUrl(paymentToken);

        return { iframeUrl };

    } catch (error: any) {
        console.error("Paymob Initiation Error:", error);
        return { error: error.message || "Internal Server Error" };
    }
}
