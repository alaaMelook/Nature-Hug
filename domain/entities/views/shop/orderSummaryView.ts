export interface OrderSummaryView {
    order_id: number;
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
    item_count: number;
    order_items: OrderSummaryItems[];
    awb: string | null;
}

export interface OrderSummaryItems {
    name_en: string;
    name_ar: string;
    quantity: number;
    slug: string;
    image: string | null;
    price: number;
}