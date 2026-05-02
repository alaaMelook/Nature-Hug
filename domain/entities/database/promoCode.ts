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
    bogo_discount_percentage: number; // Discount % on the cheapest "get" items (100 = fully free, 50 = half price)
    is_active: boolean;
    free_shipping: boolean;
    eligible_customer_ids?: number[]; // null or empty = all customers can use this code
    valid_from?: string; // When the promo code becomes active
    valid_until?: string; // When the promo code expires
    usage_limit?: number; // Max times this code can be used (null = unlimited)
    usage_count?: number; // Current number of times used
    stacking_mode?: 'additive' | 'sequential'; // How discounts stack with other codes
    // New discount features
    amount_off?: number; // Fixed amount discount in EGP (alternative to percentage_off)
    min_order_amount?: number; // Minimum cart total required to use this promo code
    auto_apply?: boolean; // If true, discount applies automatically at checkout without entering code
    bazaar_only?: boolean; // If true, this promo code only works in bazaar POS (hidden from online store)
    bazaar_id?: number | null; // DEPRECATED: single bazaar (kept for backward compatibility)
    bazaar_ids?: number[]; // If set, this promo code only works for these specific bazaars
}
