import { OrderItem } from "./orderItem";
import { CustomerAddress } from "@/domain/entities/auth/customer";

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
    guest_address: Partial<CustomerAddress>; // -> can be for users adding new address in checkout
    guest_name: string | null;
    guest_email: string | null;
    guest_phone: string | null;
    guest_phone2: string | null;
    payment_method: string;
    grand_total: number;
    customer_id: number | null;
    shipping_address_id?: number | null;
    items?: Partial<OrderItem>[];
}