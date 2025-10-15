
export interface OrderSummaryView {
    id: number;
    created_at: string;
    order_status: string;
    subtotal: number;
    discount_total: number;
    shipping_total: number;
    tax_total: number;
    grand_total: number;
    applied_promo_code?: string;
    promo_percentage?: number;
    payment_status: string;
}