export interface PaymobTransactionData {
    amount_cents: number | string;
    created_at: string;
    currency: string;
    error_occured: boolean | string;
    has_parent_transaction: boolean | string;
    id: number | string;
    integration_id: number | string;
    is_3d_secure: boolean | string;
    is_auth: boolean | string;
    is_capture: boolean | string;
    is_refunded: boolean | string;
    is_standalone_payment: boolean | string;
    is_voided: boolean | string;
    order: number | string;
    owner: number | string;
    pending: boolean | string;
    source_data_pan: string;
    source_data_sub_type: string;
    source_data_type: string;
    success: boolean | string;
    hmac?: string;
}
