import { OrderItem } from "./orderItem";

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded' | 'failed';

export interface Order {
    id: number;
    customer_id: number;
    status?: OrderStatus;
    total: number;
    customer_uuid?: string;
    note?: string | null;
    customer_phone2?: string;
    updated_at?: string;
    created_at: string;
    subtotal: number;
    discount_total: number;
    shipping_total: number;
    tax_total: number;
    grand_total: number;
    promo_code_id?: number;
    payment_method?: string;
    payment_status?: string;
    shipping_address_id?: number;
    items: OrderItem[];
}
