export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    variant_id: number;
    quantity: number;
    unit_price: number;
    discount: number | null;
    total: number;
    created_at: string;
}
