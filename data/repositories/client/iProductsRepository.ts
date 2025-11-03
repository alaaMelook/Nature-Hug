import {Category} from "@/domain/entities/database/category";
import {Product} from "@/domain/entities/database/product";
import {ProductMaterial} from "@/domain/entities/database/productMaterials";
import {ProductVariant} from "@/domain/entities/database/productVariant";
import {Review} from "@/domain/entities/database/review";
import {ProductDetailView} from "@/domain/entities/views/shop/productDetailView";
import {ProductView} from "@/domain/entities/views/shop/productView";
import {ProductRepository} from "@/domain/repositories/productRepository";
import {langStore} from "@/lib/i18n/langStore";
import {supabase} from "@/data/datasources/supabase/client";

export class IProductClientRepository implements ProductRepository {
    private currentLanguage = langStore.get();


    constructor() {
        langStore.onChange((lang) => (this.currentLanguage = lang));
    }

    async viewAll(): Promise<ProductView[]> {
        try {
            console.log("[IProductRepository] viewAll called.");
            const {
                data
            } = await supabase.schema('store').from(`products_view_${this.currentLanguage}`).select('*');

            console.log("[IProductRepository] viewAll result:", data);
            return data || [];
        } catch (error) {
            console.error("[IProductRepository] Error in viewAll:", error);
            throw error;
        }
    }

    async viewRecent(count: number): Promise<ProductView[]> {
        try {
            console.log("[IProductRepository] viewRecent called with count:", count);
            const {
                data
            } = await supabase.schema('store').from(`products_view_${this.currentLanguage}`).select('*').order('created_at', {ascending: false}).limit(count);

            console.log("[IProductRepository] viewRecent result:", data);
            return data || [];
        } catch (error) {
            console.error("[IProductRepository] Error in viewRecent:", error);
            throw error;
        }
    }

    async viewBySlug(slug: string): Promise<ProductDetailView> {
        try {
            console.log("[IProductRepository] viewBySlug called with slug:", slug);
            const {data} = await supabase
                .schema('store')
                .rpc(`get_product_detail_${this.currentLanguage}`, {slug})
                .single();

            console.log("[IProductRepository] viewBySlug result:", data);
            return data as ProductDetailView;
        } catch (error) {
            console.error("[IProductRepository] Error in viewBySlug:", error);
            throw error;
        }
    }

    async viewByCategory(categoryName: string): Promise<ProductView[]> {
        try {
            console.log("[IProductRepository] viewByCategory called with categoryName:", categoryName);
            const {
                data
            } = await supabase.schema('store').from(`products_view_${this.currentLanguage}`).select('*').eq('category_name', categoryName);

            console.log("[IProductRepository] viewByCategory result:", data);
            return data || [];
        } catch (error) {
            console.error("[IProductRepository] Error in viewByCategory:", error);
            throw error;
        }
    }

    async addReview(review: Review): Promise<void> {
        try {
            console.log("[IProductRepository] addReview called with review:", review);
            await supabase.schema('store').from('reviews').insert(review);

            console.log("[IProductRepository] Review added successfully.");
        } catch (error) {
            console.error("[IProductRepository] Error in addReview:", error);
            throw error;
        }
    }

    async getAllCategories(): Promise<Category[]> {
        try {
            console.log("[IProductRepository] getAllCategories called.");
            const {data} = await supabase.schema('store').from('categories').select('*');

            console.log("[IProductRepository] getAllCategories result:", data);
            return data || [];
        } catch (error) {
            console.error("[IProductRepository] Error in getAllCategories:", error);
            throw error;
        }
    }


    // admin

    async getAll(): Promise<Product[]> {
        try {
            console.log("[IProductRepository] getAll called.");
            const {data} = await supabase.schema('store').from('products').select('*');

            console.log("[IProductRepository] getAll result:", data);
            return data || [];
        } catch (error) {
            console.error("[IProductRepository] Error in getAll:", error);
            throw error;
        }
    }

    async getVariantsOf(product: Product): Promise<ProductVariant[]> {
        try {
            console.log("[IProductRepository] getVariantsOf called with product:", product);
            const {
                data
            } = await supabase.schema('store').from('product_variants').select('*').eq('product_id', product.id);

            console.log("[IProductRepository] getVariantsOf result:", data);
            return data || [];
        } catch (error) {
            console.error("[IProductRepository] Error in getVariantsOf:", error);
            throw error;
        }
    }

    async getAllUsedMaterials(product: Product | ProductVariant): Promise<ProductMaterial[]> {
        try {
            console.log("[IProductRepository] getAllUsedMaterials called with product:", product);
            let key_name = 'product_id' in product && product.product_id !== undefined ? 'variant_id' : 'product_id';
            const {
                data
            } = await supabase.schema('store').from('materials_used').select('*').eq(key_name, product.id);

            console.log("[IProductRepository] getAllUsedMaterials result:", data);
            return data || [];
        } catch (error) {
            console.error("[IProductRepository] Error in getAllUsedMaterials:", error);
            throw error;
        }
    }

    async getBySlug(slug: string): Promise<Product> {
        try {
            console.log("[IProductRepository] getBySlug called with slug:", slug);
            const {
                data
            } = await supabase.schema('store').from('products').select('*').eq('slug', slug).single();

            console.log("[IProductRepository] getBySlug result:", data);
            return data;
        } catch (error) {
            console.error("[IProductRepository] Error in getBySlug:", error);
            throw error;
        }
    }


}
