export interface Bundle {
    id: number;
    name: string;
    slug: string;
    description?: string;
    category_id?: number;
    image?: string;
    status: 'draft' | 'active' | 'hidden';
    bundle_type: 'fixed' | 'build_your_own' | 'mix_and_match';
    pricing_type: 'fixed_price' | 'percentage_discount' | 'fixed_amount_discount';
    discount_value: number;
    fixed_price: number;
    featured: boolean;
    visible_home: boolean;
    visible_category: boolean;
    visible_bundle_collection: boolean;
    display_order: number;
    rules?: Record<string, any>;
    created_at: string;
    updated_at: string;
}
