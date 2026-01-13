export interface ProductView {
    id: number;
    variant_id: number;
    name: string;            // from variant.name_en or product.name_en
    description: string | null;    // from variant.description_en or product.description_en
    price: number;          // from variant.price or product.price
    stock: number;
    discount: number | null;
    image: string | null;
    category_name: string | null; // Primary category (legacy)
    category_names?: string[]; // All category names (for multi-category support)
    skin_type: string;
    slug: string;
    product_type: string;
    created_at: string;
    avg_rating: number;
    product_id?: number; // Added for junction table queries
}

export interface CartItem extends ProductView {
    quantity: number;
}