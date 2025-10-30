import {createSupabaseServerClient} from "@/data/datasources/supabase/server";
import {Category} from "@/domain/entities/database/category";
import {Product} from "@/domain/entities/database/product";
import {ProductMaterial} from "@/domain/entities/database/productMaterials";
import {ProductVariant} from "@/domain/entities/database/productVariant";
import {Review} from "@/domain/entities/database/review";
import {ProductDetailView} from "@/domain/entities/views/shop/productDetailView";
import {ProductView} from "@/domain/entities/views/shop/productView";
import {ProductRepository} from "@/domain/repositories/productRepository";
import {langStore} from "@/lib/i18n/langStore";
import {Order} from "@/domain/entities/database/order";
import {supabase} from "@/data/datasources/supabase/client";

export class IProductRepository implements ProductRepository {
    private currentLanguage = langStore.get();
    private supabase;


    constructor(useClient: boolean = false) {
        this.supabase = useClient ? supabase : createSupabaseServerClient();
        langStore.onChange((lang) => (this.currentLanguage = lang));
    }

    async viewAll(): Promise<ProductView[]> {
        try {
            console.log("[IProductRepository] viewAll called.");
            const {
                data,
                error
            } = await (await this.supabase).schema('store').from(`products_view_${this.currentLanguage}`).select('*');
            if (error) throw error;
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
                data,
                error
            } = await (await this.supabase).schema('store').from(`products_view_${this.currentLanguage}`).select('*').order('created_at', {ascending: false}).limit(count);
            if (error) throw error;
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
            const {data, error} = await (await this.supabase)
                .schema('store')
                .rpc(`get_product_detail_${this.currentLanguage}`, {slug})
                .single();
            if (error) throw error;
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
                data,
                error
            } = await (await this.supabase).schema('store').from(`products_view_${this.currentLanguage}`).select('*').eq('category_name', categoryName);
            if (error) throw error;
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
            const {error} = await (await this.supabase).schema('store').from('reviews').insert(review);
            if (error) throw error;
            console.log("[IProductRepository] Review added successfully.");
        } catch (error) {
            console.error("[IProductRepository] Error in addReview:", error);
            throw error;
        }
    }

    async getAllCategories(): Promise<Category[]> {
        try {
            console.log("[IProductRepository] getAllCategories called.");
            const {data, error} = await (await this.supabase).schema('store').from('categories').select('*');
            if (error) throw error;
            console.log("[IProductRepository] getAllCategories result:", data);
            return data || [];
        } catch (error) {
            console.error("[IProductRepository] Error in getAllCategories:", error);
            throw error;
        }
    }

    async createOrder(orderData: Order): Promise<void> {
        try {
            console.log("[IProductRepository] createOrder called with orderData:", orderData);
            const {error} = await (await this.supabase).schema('store').rpc('create_full_order', {orderData: orderData});
            if (error) throw error;
            console.log("[IProductRepository] Order created successfully.");
        } catch (error) {
            console.error("[IProductRepository] Error in createOrder:", error);
            throw error;
        }
    }

    // admin

    async getAll(): Promise<Product[]> {
        try {
            console.log("[IProductRepository] getAll called.");
            const {data, error} = await (await this.supabase).schema('store').from('products').select('*');
            if (error) throw error;
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
                data,
                error
            } = await (await this.supabase).schema('store').from('product_variants').select('*').eq('product_id', product.id);
            if (error) throw error;
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
                data,
                error
            } = await (await this.supabase).schema('store').from('materials_used').select('*').eq(key_name, product.id);
            if (error) throw error;
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
                data,
                error
            } = await (await this.supabase).schema('store').from('products').select('*').eq('slug', slug).single();
            if (error) throw error;
            console.log("[IProductRepository] getBySlug result:", data);
            return data;
        } catch (error) {
            console.error("[IProductRepository] Error in getBySlug:", error);
            throw error;
        }
    }

    async uploadImage(file: File): Promise<string> {
        try {
            console.log("[IProductRepository] uploadImage called with file:", file.name);
            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

            const {data, error} = await (await this.supabase).storage
                .from("product-images")
                .upload(fileName, file, {contentType: file.type});

            if (error) {
                console.error("[IProductRepository] Error uploading image:", error);
                throw error;
            }
            if (data == null) {
                console.error('[IProductRepository] no data returned from upload');
                return '';
            }
            const {data: url} = (await this.supabase).storage
                .from("product-images")
                .getPublicUrl(data.path);

            console.log("[IProductRepository] Image uploaded successfully, URL:", url.publicUrl);
            return url.publicUrl;

        } catch (err: unknown) {
            const error = err as Error;
            console.error("[IProductRepository] Upload error:", error.message);
            throw new Error(error.message);
        }
    }


}
