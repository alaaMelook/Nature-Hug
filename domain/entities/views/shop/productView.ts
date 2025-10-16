
export interface ProductView {
    id: number;
    name: string;            // from variant.name_en or product.name_en
    description?: string | null;    // from variant.description_en or product.description_en
    price: number;          // from variant.price or product.price
    stock: number;
    discount?: number | null;
    image?: string | null;
    category_name?: string | null;
    skin_type: string;
    slug: string;
    product_type: string;
    created_at: string;
    avg_rating: number;
}
