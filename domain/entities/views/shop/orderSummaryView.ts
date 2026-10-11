export interface OrderSummaryView {
    order_id: number;
    created_at: string;
    order_status: string;
    subtotal: number;
    discount_total: number;
    shipping_total: number;
    tax_total: number;
    grand_total: number;       // final payable amount stored by the server
    applied_promo_code?: string;
    promo_percentage?: number;
    payment_status: string;
    item_count: number;
    order_items: OrderSummaryItems[];
    awb: string | null;
    /** Parsed from orders.note — holds bundle name + discount info */
    bundle_metadata?: BundleOrderMeta[] | null;
    /** Raw note field from orders table */
    note?: string | null;
}

export interface OrderSummaryItems {
    name_en: string;
    name_ar: string;
    quantity: number;
    slug: string;
    image: string | null;
    price: number;
    /** Per-unit bundle discount for this item (from order_items.discount) */
    discount_per_unit?: number;
}

export interface BundleOrderMeta {
    name: string;
    raw_name?: string;
    slug: string;
    total_discount: number;
    item_count: number;
}