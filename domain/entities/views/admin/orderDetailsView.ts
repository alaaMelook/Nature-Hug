export interface OrderDetailsView {
    order_id: number;
    order_status: string;
    order_date: string;
    final_order_total: number;
    customer_email: string;
    shipping_street_address: string;
    shipping_governorate: string;
    applied_promo_code?: string;
    promo_percentage?: number;
    quantity: number;
    unit_price: number;
    item_discount_per_unit: number;
    line_item_total: number;
    item_name: string;
    item_type: string;
    product: string;
    type: string;
    customer_name?: string;
    customer_phone: string[];
}