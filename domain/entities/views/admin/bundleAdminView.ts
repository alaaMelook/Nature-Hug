import { Bundle } from "../../database/bundle";
import { Category } from "../../database/category";

export interface BundleItemView {
    id: number;
    bundle_id: number;
    product_id: number;
    variant_id?: number | null;
    quantity: number;
    notes?: string;
    sort_order: number;
    
    // Joined product details
    product_name_en: string;
    product_name_ar: string;
    product_image?: string;
    
    // Joined variant details
    variant_name_en?: string;
    variant_name_ar?: string;
    variant_image?: string;
    
    // Pricing and stock
    price: number;
    discount: number;
    stock: number;
}

export interface BundleAdminView extends Bundle {
    category_name_en?: string;
    category_name_ar?: string;
    category?: Category;
    items: BundleItemView[];
    item_count: number;
    original_total: number;
    final_price: number;
}
