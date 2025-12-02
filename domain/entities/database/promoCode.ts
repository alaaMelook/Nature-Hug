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
}
