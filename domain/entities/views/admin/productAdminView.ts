import { Category } from "../../database/category";
import { FAQs } from "../../database/faq";

export interface ProductAdminView {
    product_id: number;
    variant_id: number | null;
    name_en: string;
    name_ar: string;
    description_en: string;
    description_ar: string;
    price: number;
    discount: number;
    image: string;
    category_id?: number;
    category_name_en?: string;
    category_name_ar?: string;
    category?: Category;
    skin_type: string;
    slug: string;
    stock: number;
    product_type: string;
    highlight_en: string;
    highlight_ar: string;
    faq_en: any;
    faq_ar: any;
    gallery: (string | undefined)[];
    variants: ProductVariantAdminView[];
    materials: ProductMaterialAdminView[];
}

export interface ProductVariantAdminView {
    id: number;
    product_id: number;
    name_en: string;
    name_ar: string;
    price: number;
    stock: number;
    discount: number;
    description_en: string;
    description_ar: string;
    type_en: string;
    type_ar: string;
    image: string;
    gallery: (string | undefined)[];
    slug: string;
    materials: ProductMaterialAdminView[];
}

export interface ProductMaterialAdminView {
    id: number;
    measurement_unit?: string;
    grams_used?: number; // Keep for compatibility if needed
    // UI helper fields
    material_name?: string;
    material_type?: string;
    price?: number;

}
