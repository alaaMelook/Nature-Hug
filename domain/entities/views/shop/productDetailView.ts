// src/domain/entities/views/ProductDetailView.ts

import { FAQs } from "../../database/faq";

export interface ProductDetailView {

    id: number;
    name: string;
    description?: string | null;
    price: number;
    stock: number;
    discount?: number | null;
    image?: string | null;

    category_name?: string | null;
    skin_type?: string | null;
    type?: string | null
    slug?: string | null;
    product_type?: string | null;
    highlight?: string | null;
    faq?: FAQs;
    created_at: string;
    gallery: string[];

    variants: ProductVariantView[];


    reviews: ProductReviewView[];
    materials: ProductMaterialView[];


    avg_rating: number;
}

/** Embedded review objects from JSONB aggregation */
export interface ProductReviewView {
    id: number;
    rating: number;
    comment?: string | null;
    created_at: string;
    customer_name?: string | null;
}

/** Embedded materials objects from JSONB aggregation */
export interface ProductMaterialView {
    id: number;
    material_name: string;
    grams_used: number;
    measurement_unit: string;
    material_type?: string | null;
}

export interface ProductVariantView {
    id: number;
    name: string;
    price: number;
    stock: number;
    slug: string;
    type: string;
}
