export interface BundleItem {
    id: number;
    bundle_id: number;
    product_id: number;
    variant_id?: number | null;
    quantity: number;
    notes?: string;
    sort_order: number;
    created_at: string;
}
