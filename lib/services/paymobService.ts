import { PaymobAuthRequest, PaymobAuthResponse } from "@/domain/entities/paymob/auth";
import { PaymobOrderRequest, PaymobOrderResponse } from "@/domain/entities/paymob/order";
import { PaymobPaymentKeyRequest, PaymobPaymentKeyResponse, PaymobBillingData } from "@/domain/entities/paymob/paymentKey";
import { PaymobTransactionData } from "@/domain/entities/paymob/transaction";

export class PaymobService {
    private static instance: PaymobService;
    private API_KEY = process.env.PAYMOB_API_KEY;
    private INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
    private IFRAME_ID = process.env.PAYMOB_IFRAME_ID;
    private HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET;
    private BASE_URL = "https://accept.paymob.com/api";

    private constructor() { }

    public static getInstance(): PaymobService {
        if (!PaymobService.instance) {
            PaymobService.instance = new PaymobService();
        }
        return PaymobService.instance;
    }

    /**
     * Authenticate with Paymob to get an auth token.
     */
    async authenticate(): Promise<string> {
        const body: PaymobAuthRequest = { api_key: this.API_KEY! };
        const response = await fetch(`${this.BASE_URL}/auth/tokens`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error("Failed to authenticate with Paymob");
        }

        const data: PaymobAuthResponse = await response.json();
        return data.token;
    }

    /**
     * Register an order with Paymob.
     */
    async registerOrder(authToken: string, amountCents: number, merchantOrderId: string): Promise<number> {
        const body: PaymobOrderRequest = {
            auth_token: authToken,
            delivery_needed: "false",
            amount_cents: amountCents,
            currency: "EGP",
            merchant_order_id: merchantOrderId,
        };

        const response = await fetch(`${this.BASE_URL}/ecommerce/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error("Failed to register order with Paymob");
        }

        const data: PaymobOrderResponse = await response.json();
        return data.id;
    }

    /**
     * Request a payment key for the order.
     */
    async requestPaymentKey(
        authToken: string,
        orderId: number,
        amountCents: number,
        billingData: PaymobBillingData
    ): Promise<string> {
        const body: PaymobPaymentKeyRequest = {
            auth_token: authToken,
            amount_cents: amountCents,
            expiration: 3600,
            order_id: orderId,
            billing_data: billingData,
            currency: "EGP",
            integration_id: Number(this.INTEGRATION_ID),
            lock_order_when_paid: "false"
        };

        const response = await fetch(`${this.BASE_URL}/acceptance/payment_keys`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Paymob Payment Key Error:", errorData);
            throw new Error("Failed to request payment key");
        }

        const data: PaymobPaymentKeyResponse = await response.json();
        return data.token;
    }

    /**
     * Get the iframe URL for the payment.
     */
    getIframeUrl(paymentToken: string): string {
        return `https://accept.paymob.com/api/acceptance/iframes/${this.IFRAME_ID}?payment_token=${paymentToken}`;
    }

    /**
     * Verify HMAC from Paymob.
     */
    verifyHmac(data: PaymobTransactionData): boolean {
        if (!this.HMAC_SECRET) {
            console.error("PAYMOB_HMAC_SECRET is not set");
            return false;
        }

        const {
            amount_cents,
            created_at,
            currency,
            error_occured,
            has_parent_transaction,
            id,
            integration_id,
            is_3d_secure,
            is_auth,
            is_capture,
            is_refunded,
            is_standalone_payment,
            is_voided,
            order,
            owner,
            pending,
            source_data_pan,
            source_data_sub_type,
            source_data_type,
            success,
        } = data;

        const connectedString = [
            amount_cents,
            created_at,
            currency,
            error_occured,
            has_parent_transaction,
            id,
            integration_id,
            is_3d_secure,
            is_auth,
            is_capture,
            is_refunded,
            is_standalone_payment,
            is_voided,
            order,
            owner,
            pending,
            source_data_pan,
            source_data_sub_type,
            source_data_type,
            success,
        ].join("");

        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha512', this.HMAC_SECRET);
        hmac.update(connectedString);
        const calculatedHmac = hmac.digest('hex');

        return calculatedHmac === data.hmac;
    }
}

export const paymobService = PaymobService.getInstance();
