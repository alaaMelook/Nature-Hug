export interface PaymobBillingData {
    apartment: string;
    email: string;
    floor: string;
    first_name: string;
    street: string;
    building: string;
    phone_number: string;
    shipping_method: string;
    postal_code: string;
    city: string;
    country: string;
    last_name: string;
    state: string;
}

export interface PaymobPaymentKeyRequest {
    auth_token: string;
    amount_cents: number;
    expiration: number;
    order_id: number;
    billing_data: PaymobBillingData;
    currency: string;
    integration_id: number;
    lock_order_when_paid?: string;
}

export interface PaymobPaymentKeyResponse {
    token: string;
}
