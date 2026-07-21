// Bundle Detail View — used on the storefront bundle detail page

export interface BundleDetailView {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    category_name: string;
    bundle_type: string;
    pricing_type: 'fixed_price' | 'percentage_discount' | 'fixed_amount_discount';
    discount_value: number;
    fixed_price: number;
    original_total: number;
    final_price: number;
    discount: number;
    stock: number;
    featured: boolean;
    rules?: {
        min_quantity?: number | null;
        max_quantity?: number | null;
        allow_duplicate_products?: boolean;
        allow_duplicate_variants?: boolean;
        max_variants_per_product?: number | null;
    } | null;
    items: BundleDetailItem[];
}

export interface BundleDetailItem {
    id: number;
    bundle_id: number;
    product_id: number;
    quantity: number;
    notes?: string | null;
    sort_order: number;
    product: {
        id: number;
        name: string;
        image: string;
        price: number;
        discount?: number | null;
        stock: number;
        slug: string;
        description?: string | null;
    };
    has_variants: boolean;
    variants: BundleItemVariantOption[];
}

export interface BundleItemVariantOption {
    id: number;
    name_en: string;
    name_ar: string;
    price: number;
    discount?: number | null;
    stock: number;
    image?: string | null;
    slug: string;
    type_en?: string;
    type_ar?: string;
}
