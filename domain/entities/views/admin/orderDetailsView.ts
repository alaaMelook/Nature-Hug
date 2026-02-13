export interface OrderDetailsView {
    order_id: number;
    order_status: string;
    order_date: string | Date;
    final_order_total: number;
    payment_status: string;
    payment_method: string;
    customer_email: string;
    customer_name: string;
    shipping_street_address: string;
    shipping_governorate: string;
    applied_promo_code: string;
    applied_promo_codes?: { id: number; code: string; discount: number; auto_apply?: boolean }[] | null;
    promo_percentage: number;
    phone_numbers: string[];
    items: OrderItemView[];
    shipment_id?: string;
    awb: string | null;
    subtotal: number;
    shipping_total: number;
    discount_total: number;
    governorate_slug: string;
    // Creator information (for admin/moderator created orders)
    created_by_user_id: string | null;
    created_by_user_name: string | null;
    created_by_user_role: 'admin' | 'moderator' | null;
    // Order notes
    note: string | null;
    // Packing status
    packed?: boolean;
}
export interface OrderItemView {
    id?: number; // Order item ID for database updates
    quantity: number;
    unit_price: number;
    item_discount_per_unit: number;
    line_item_total: number;
    item_name: string;
    item_type: string;
    product_base_name: string;
    variant_name: string;
    variant_type: string;
}
