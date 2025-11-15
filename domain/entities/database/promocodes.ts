export interface PromoCode {
    id: number,
    code: string,
    percentage_off: string,
    created_at: string,

    all_cart: boolean,
    eligible_variant_ids: number[],
    eligible_product_ids: number[]
}