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
    category_ids?: number[]; // Changed from category_id to support multiple categories
    categories?: Category[]; // Array of category objects
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
    visible: boolean;
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
    material_id?: number; // The actual material ID from the materials table
    measurement_unit?: string;
    grams_used?: number; // Keep for compatibility if needed
    // UI helper fields
    material_name?: string;
    material_type?: string;
    price?: number;

}
