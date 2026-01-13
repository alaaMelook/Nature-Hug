import { Category } from "@/domain/entities/database/category";
import { Product } from "@/domain/entities/database/product";
import { ProductMaterial } from "@/domain/entities/database/productMaterials";
import { ProductVariant } from "@/domain/entities/database/productVariant";
import { Review } from "@/domain/entities/database/review";
import { PromoCode } from "@/domain/entities/database/promoCode";
import { ProductDetailView } from "@/domain/entities/views/shop/productDetailView";
import { ProductView } from "@/domain/entities/views/shop/productView";
import { ProductRepository } from "@/domain/repositories/productRepository";
import { supabase } from "@/data/datasources/supabase/client";

export class IProductClientRepository implements ProductRepository {


    constructor(private lang: LangKey = 'ar') { }

    async viewAll(): Promise<ProductView[]> {
        console.log("[IProductRepository] viewAll called.");
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('store').from(`products_view_${this.lang}`).select('*');

        console.log("[IProductRepository] viewAll result:", { data, status, statusText });
        if (error) {
            console.error("[IProductRepository] viewAll error:", error);
            throw error;
        }
        return data || [];
    }

    async viewRecent(count: number): Promise<ProductView[]> {
        console.log("[IProductRepository] viewRecent called with count:", count);
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('store').from(`products_view_${this.lang}`).select('*').order('created_at', { ascending: false }).limit(count);

        console.log("[IProductRepository] viewRecent result:", { data, status, statusText });
        if (error) {
            console.error("[IProductRepository] viewRecent error:", error);
            throw error;
        }
        return data || [];
    }
    async viewBySlug(slug: string): Promise<ProductView> {
        console.log("[IProductRepository] viewBySlug called with slug:", slug);
        const { data, status, statusText, error } = await supabase
            .schema('store')
            .from(`products_view_${this.lang}`)
            .select('*')
            .eq('slug', slug)
            .single();
        console.log("[IProductRepository] viewBySlug result:", { data, status, statusText });
        if (error) {
            console.error("[IProductRepository] viewBySlug error:", error);
            throw error;
        }
        return data;
    }

    async viewBySlugs(slugs: string[]): Promise<ProductView[]> {
        console.log("[IProductRepository] viewBySlugs called with slugs:", slugs);
        if (!slugs.length) return [];

        const { data, status, statusText, error } = await supabase
            .schema('store')
            .from(`products_view_${this.lang}`)
            .select('*')
            .in('slug', slugs);

        console.log("[IProductRepository] viewBySlugs result:", { data, status, statusText });
        if (error) {
            console.error("[IProductRepository] viewBySlugs error:", error);
            throw error;
        }
        return data || [];
    }




    async viewDetailedBySlug(slug: string): Promise<ProductDetailView> {
        console.log("[IProductRepository] Detailed called with slug:", slug);
        const { data, status, statusText, error } = await supabase
            .schema('store')
            .rpc(`get_product_detail_${this.lang}`, { slug })
            .single();

        console.log("[IProductRepository] Detailed result:", { data, status, statusText });
        if (error) {
            console.error("[IProductRepository] Detailed error:", error);
            throw error;
        }
        return data as ProductDetailView;
    }

    async viewByCategory(categoryName: string): Promise<ProductView[]> {
        console.log("[IProductRepository] viewByCategory called with categoryName:", categoryName);
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('store').from(`products_view_${this.lang}`).select('*').eq('category_name', categoryName);

        console.log("[IProductRepository] viewByCategory result:", { data, status, statusText });
        if (error) {
            console.error("[IProductRepository] viewByCategory error:", error);
            throw error;
        }
        return data || [];
    }

    async addReview(review: Partial<Review>): Promise<number> {
        console.log("[IProductRepository] addReview called with review:", review);
        const { data, status, statusText, error } = await supabase
            .schema('store')
            .from('reviews')
            .insert({
                product_id: review.product_id,
                customer_id: review.customer_id,
                rating: review.rating,
                comment: review.comment,
                status: 'approved',
            })
            .select('id')
            .single();
        console.log("[IProductRepository] addReview result:", { data, status, statusText });
        if (error) {
            console.error("[IProductRepository] addReview error:", error);
            throw error;
        }
        return data.id;
    }

    async getAllCategories(): Promise<Category[]> {
        console.log("[IProductRepository] getAllCategories called.");
        const { data, status, statusText, error } = await supabase.schema('store').from('categories').select('*');

        console.log("[IProductRepository] getAllCategories result:", { data, status, statusText });
        if (error) {
            console.error("[IProductRepository] getAllCategories error:", error);
            throw error;
        }
        return data || [];
    }


    // admin

    async getAll(): Promise<Product[]> {
        console.log("[IProductRepository] getAll called.");
        const { data, status, statusText, error } = await supabase.schema('store').from('products').select('*');

        console.log("[IProductRepository] getAll result:", { data, status, statusText });
        if (error) {
            console.error("[IProductRepository] getAll error:", error);
            throw error;
        }
        return data || [];
    }

    async getVariantsOf(product: Product): Promise<ProductVariant[]> {
        console.log("[IProductRepository] getVariantsOf called with product:", product);
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('store').from('product_variants').select('*').eq('product_id', product.id);

        console.log("[IProductRepository] getVariantsOf result:", { data, status, statusText });
        if (error) {
            console.error("[IProductRepository] getVariantsOf error:", error);
            throw error;
        }
        return data || [];
    }

    async getAllUsedMaterials(product: Product | ProductVariant): Promise<ProductMaterial[]> {
        console.log("[IProductRepository] getAllUsedMaterials called with product:", product);
        let key_name = 'product_id' in product && product.product_id !== undefined ? 'variant_id' : 'product_id';
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('store').from('materials_used').select('*').eq(key_name, product.id);

        console.log("[IProductRepository] getAllUsedMaterials result:", { data, status, statusText });
        if (error) {
            console.error("[IProductRepository] getAllUsedMaterials error:", error);
            throw error;
        }
        return data || [];
    }

    async getBySlug(slug: string): Promise<Product> {
        console.log("[IProductRepository] getBySlug called with slug:", slug);
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('store').from('products').select('*').eq('slug', slug).single();

        console.log("[IProductRepository] getBySlug result:", { data, status, statusText });
        if (error) {
            console.error("[IProductRepository] getBySlug error:", error);
            throw error;
        }
        return data;
    }


    async getPromoCode(code: string): Promise<PromoCode | null> {
        console.log("[IProductRepository] getPromoCode called with code:", code);
        const { data, error } = await supabase.schema('store')
            .from('promo_codes')
            .select('*')
            .eq('code', code)
            .single();

        if (error) {
            console.error("[IProductRepository] getPromoCode error:", error);
            return null;
        }
        return data as PromoCode;
    }
}
