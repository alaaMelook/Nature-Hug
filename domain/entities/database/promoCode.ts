export interface PromoCode {
    id: number;
    code: string;
    percentage_off: number;
    created_at: string;
    all_cart: boolean;
    eligible_product_slugs: string[];
    is_bogo: boolean;
    bogo_buy_count: number;
    bogo_get_count: number;
    is_active: boolean;
    free_shipping: boolean;
    eligible_customer_ids?: number[]; // null or empty = all customers can use this code
    valid_from?: string; // When the promo code becomes active
    valid_until?: string; // When the promo code expires
    usage_limit?: number; // Max times this code can be used (null = unlimited)
    usage_count?: number; // Current number of times used
    stacking_mode?: 'additive' | 'sequential'; // How discounts stack with other codes
}
