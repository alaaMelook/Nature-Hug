export interface ProductVariant {
    id: number;
    product_id: number;
    name_en: string;
    name_ar?: string;
    price?: number;
    stock?: number;
    discount?: number;
    description_en?: string;
    description_ar?: string;
    size?: string;
    fragrance?: string;
    image?: string;
    gallery: string[];
    created_at: string;
}
