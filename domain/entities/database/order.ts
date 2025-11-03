import {OrderItem} from "./orderItem";
import {CustomerAddress} from "@/domain/entities/auth/customer";

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded' | 'failed';

export interface Order {
    id: number;
    customer_id: number | null;
    status: OrderStatus;
    note: string | null;
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
    shipping_address_id?: number | null;
    items: Partial<OrderItem>[];
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    guest_phone2: string | null;
    guest_address: Partial<CustomerAddress>;
}