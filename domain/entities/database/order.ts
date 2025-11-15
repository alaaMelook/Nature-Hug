import {OrderItem} from "./orderItem";
import {CustomerAddress} from "@/domain/entities/auth/customer";

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded' | 'failed';

export interface Order {
    // Common
    id: number;
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
    items: Partial<OrderItem>[];

    // For Users
    shipping_address_id?: number | null;
    customer_id: number | null;

    // For Guests
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    guest_phone2: string | null;
    guest_address: Partial<CustomerAddress>; // -> can be for users adding new address in checkout
}