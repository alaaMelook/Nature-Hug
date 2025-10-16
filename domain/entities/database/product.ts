import { ProductMaterial } from "./productMaterials";
import { ProductVariant } from "./productVariant";

export interface Product {
    id: number;
    created_at: string;
    name_en?: string;
    description_en?: string;
    price: number;
    discount?: number;
    image_url?: string;
    name_ar?: string;
    description_ar?: string;
    category_id?: number;
    skin_type?: string;
    sizes?: string;
    slug?: string;
    stock?: number;
    product_type?: string; // normal | bundle | etc.
    highlight_en?: string;
    highlight_ar?: string;
    faq_en?: Record<string, any>;
    faq_ar?: Record<string, any>;
    gallery: string[];
    variants: ProductVariant[];
    materials: ProductMaterial[];
}