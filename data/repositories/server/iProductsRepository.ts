import { createSupabaseServerClient } from "@/data/datasources/supabase/server";
import { Category } from "@/domain/entities/database/category";
import { Product } from "@/domain/entities/database/product";
import { ProductMaterial } from "@/domain/entities/database/productMaterials";
import { ProductVariant } from "@/domain/entities/database/productVariant";
import { Review } from "@/domain/entities/database/review";
import { ProductDetailView } from "@/domain/entities/views/shop/productDetailView";
import { ProductView } from "@/domain/entities/views/shop/productView";
import { ProductRepository } from "@/domain/repositories/productRepository";
import { PromoCode } from "@/domain/entities/database/promoCode";


export class IProductServerRepository implements ProductRepository {


    constructor(private lang: LangKey = 'ar') { }


    async viewAll(): Promise<ProductView[]> {
        console.log("[IProductRepository] viewAll called.");
        const supabase = await createSupabaseServerClient();
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

        if (!data || data.length === 0) {
            return [];
        }

        // Fetch category names for all products from junction table
        const productIds = [...new Set(data.map((p: any) => p.product_id).filter((id: any) => id !== undefined && id !== null))];

        console.log("[IProductRepository] viewAll - productIds:", productIds);

        // If no valid product IDs, return products with empty category_names
        if (productIds.length === 0) {
            return data.map((product: any) => ({
                ...product,
                category_names: []
            }));
        }

        // Step 1: Get product-category links (use service client to bypass RLS)
        const { createSupabaseServiceClient } = await import("@/data/datasources/supabase/server");
        const serviceSupabase = await createSupabaseServiceClient();

        const { data: productCategoryLinks, error: pcError } = await serviceSupabase.schema('store')
            .from('product_categories')
            .select('product_id, category_id')
            .in('product_id', productIds);

        console.log("[IProductRepository] viewAll - productCategoryLinks count:", productCategoryLinks?.length || 0);
        // Only log error if it has a meaningful message
        if (pcError?.message) {
            console.error("[IProductRepository] viewAll - productCategories error:", pcError.message);
        }

        // Step 2: Get all categories
        const categoryIds = [...new Set((productCategoryLinks || []).map(pc => pc.category_id))];
        let categoriesMap: Record<number, { name_en: string; name_ar: string }> = {};

        if (categoryIds.length > 0) {
            const { data: categoriesData, error: catError } = await supabase.schema('store')
                .from('categories')
                .select('id, name_en, name_ar')
                .in('id', categoryIds);

            if (catError) {
                console.error("[IProductRepository] viewAll - categories fetch error:", catError);
            }

            for (const cat of (categoriesData || [])) {
                categoriesMap[cat.id] = { name_en: cat.name_en, name_ar: cat.name_ar };
            }
        }

        console.log("[IProductRepository] viewAll - categoriesMap:", JSON.stringify(categoriesMap));

        // Step 3: Build map of product_id to category names
        const categoryNamesMap: Record<number, string[]> = {};
        const categoryColumn = this.lang === 'ar' ? 'name_ar' : 'name_en';

        for (const pc of (productCategoryLinks || [])) {
            if (!categoryNamesMap[pc.product_id]) {
                categoryNamesMap[pc.product_id] = [];
            }
            const catData = categoriesMap[pc.category_id];
            if (catData) {
                const catName = catData[categoryColumn as keyof typeof catData];
                if (catName && !categoryNamesMap[pc.product_id].includes(catName)) {
                    categoryNamesMap[pc.product_id].push(catName);
                }
            }
        }

        console.log("[IProductRepository] viewAll - categoryNamesMap:", JSON.stringify(categoryNamesMap));

        // Attach category_names to each product
        return data.map((product: any) => ({
            ...product,
            category_names: categoryNamesMap[product.product_id] || []
        }));
    }

    async viewRecent(count: number): Promise<ProductView[]> {
        console.log("[IProductRepository] viewRecent called with count:", count);
        const supabase = await createSupabaseServerClient();
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
        const supabase = await createSupabaseServerClient();
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
        if (slugs.length === 0) return [];
        const supabase = await createSupabaseServerClient();
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

    async checkSlug(slug: string): Promise<boolean> {
        console.log("[IProductRepository] checkSlug called with slug:", slug);
        const supabase = await createSupabaseServerClient();
        const { data, status, statusText, error } = await supabase
            .schema('store')
            .from(`products_view_${this.lang}`)
            .select('*')
            .eq('slug', slug)
            .maybeSingle();
        if (data) {
            return true;
        }
        console.log("[IProductRepository] checkSlug result:", { data, status, statusText });
        if (error) {
            console.error("[IProductRepository] checkSlug error:", error);
            throw error;
        }
        return false;
    }
    async viewDetailedBySlug(slug: string): Promise<ProductDetailView> {
        console.log("[IProductRepository] viewBySlug called with slug:", slug);
        const supabase = await createSupabaseServerClient();
        const { data, status, statusText, error } = await supabase
            .schema('store')
            .rpc(`get_product_detail_${this.lang}`, { slug })
            .single();

        console.log("[IProductRepository] viewBySlug result:", { data, status, statusText });
        if (error) {
            console.error("[IProductRepository] viewBySlug error:", error);
            throw error;
        }
        return data as ProductDetailView;
    }

    async viewByCategory(categoryName: string): Promise<ProductView[]> {
        console.log("[IProductRepository] viewByCategory called with categoryName:", categoryName);
        const supabase = await createSupabaseServerClient();

        // File logging for debugging
        const fs = await import('fs');
        const logPath = 'd:/Desktop/Nature Hug/System/Nature-Hug/debug-log.txt';
        const log = (msg: string) => {
            const timestamp = new Date().toISOString();
            fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
        };

        log(`viewByCategory called with categoryName: ${categoryName}`);
        log(`Language: ${this.lang}`);

        // First, get the category ID by name
        const categoryColumn = this.lang === 'ar' ? 'name_ar' : 'name_en';
        log(`Looking for category in column: ${categoryColumn}`);

        const { data: categoryData, error: catError } = await supabase.schema('store')
            .from('categories')
            .select('id')
            .eq(categoryColumn, categoryName)
            .single();

        log(`Category lookup result: ${JSON.stringify(categoryData)}`);
        if (catError) log(`Category lookup error: ${JSON.stringify(catError)}`);

        if (!categoryData) {
            log(`Category not found: ${categoryName}`);
            console.log("[IProductRepository] Category not found:", categoryName);
            return [];
        }

        log(`Found category ID: ${categoryData.id}`);

        // Get product IDs that have this category
        const { data: productCategoryLinks, error: pcError } = await supabase.schema('store')
            .from('product_categories')
            .select('product_id')
            .eq('category_id', categoryData.id);

        log(`product_categories query result: ${JSON.stringify(productCategoryLinks)}`);
        if (pcError) log(`product_categories query error: ${JSON.stringify(pcError)}`);

        const productIds = (productCategoryLinks || []).map(pc => pc.product_id);
        log(`Product IDs found: ${JSON.stringify(productIds)}`);

        if (productIds.length === 0) {
            log(`No products found for category: ${categoryName}`);
            console.log("[IProductRepository] No products found for category:", categoryName);
            return [];
        }

        // Get products from the view that match these IDs
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('store')
            .from(`products_view_${this.lang}`)
            .select('*')
            .in('product_id', productIds);

        log(`Final products query: ${data?.length || 0} products, status: ${status}`);
        if (error) log(`Final products query error: ${JSON.stringify(error)}`);

        console.log("[IProductRepository] viewByCategory result:", { data, status, statusText });
        if (error) {
            console.error("[IProductRepository] viewByCategory error:", error);
            throw error;
        }
        return data || [];
    }

    async addReview(review: Partial<Review>): Promise<number> {
        console.log("[IProductRepository] addReview called with review:", review);
        // Use service role client to bypass RLS
        const { createSupabaseServiceClient } = await import("@/data/datasources/supabase/server");
        const supabase = await createSupabaseServiceClient();
        const { data, status, statusText, error } = await supabase
            .schema('store')
            .from('reviews')
            .insert({
                product_id: review.product_id,
                customer_id: review.customer_id,
                rating: review.rating,
                comment: review.comment,
                status: 'pending', // Reviews show immediately but need admin approval
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

    async updateReview(reviewId: number, customerId: number, updateData: { rating?: number; comment?: string }): Promise<boolean> {
        console.log("[IProductRepository] updateReview called with:", { reviewId, customerId, updateData });
        const { createSupabaseServiceClient } = await import("@/data/datasources/supabase/server");
        const supabase = await createSupabaseServiceClient();

        // Update only if the review belongs to the customer
        const { data, error } = await supabase
            .schema('store')
            .from('reviews')
            .update({
                rating: updateData.rating,
                comment: updateData.comment,
            })
            .eq('id', reviewId)
            .eq('customer_id', customerId) // Security: only update own review
            .select('id')
            .single();

        if (error) {
            console.error("[IProductRepository] updateReview error:", error);
            throw error;
        }

        console.log("[IProductRepository] updateReview result:", data);
        return !!data;
    }

    async getAllCategories(): Promise<Category[]> {
        console.log("[IProductRepository] getAllCategories called.");
        const supabase = await createSupabaseServerClient();
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
        const supabase = await createSupabaseServerClient();
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
        const supabase = await createSupabaseServerClient();
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
        const supabase = await createSupabaseServerClient();
        const { data, status, statusText, error } = await supabase
            .schema('store')
            .from('materials_used')
            .select('*')
            .eq(key_name, product.id);

        console.log("[IProductRepository] getAllUsedMaterials result:", { data, status, statusText });
        if (error) {
            console.error("[IProductRepository] getAllUsedMaterials error:", error);
            throw error;
        }
        return data || [];
    }

    async getBySlug(slug: string): Promise<Product> {
        console.log("[IProductRepository] getBySlug called with slug:", slug);
        const supabase = await createSupabaseServerClient();
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
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .schema('store')
            .from('promo_codes')
            .select('*')
            .eq('code', code)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // Not found
                return null;
            }
            console.error("[IProductRepository] getPromoCode error:", error);
            throw error;
        }
        return data;
    }

    async getAutoApplyPromoCodes(): Promise<PromoCode[]> {
        console.log("[IProductRepository] getAutoApplyPromoCodes called");
        const supabase = await createSupabaseServerClient();
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .schema('store')
            .from('promo_codes')
            .select('*')
            .eq('is_active', true)
            .eq('auto_apply', true);

        if (error) {
            console.error("[IProductRepository] getAutoApplyPromoCodes error:", error);
            throw error;
        }

        // Filter by time validity on the server side
        const validCodes = (data || []).filter((promo: PromoCode) => {
            // Check valid_from
            if (promo.valid_from && new Date(promo.valid_from) > new Date(now)) {
                return false;
            }
            // Check valid_until
            if (promo.valid_until && new Date(promo.valid_until) < new Date(now)) {
                return false;
            }
            // Check usage limit
            if (promo.usage_limit && promo.usage_count && promo.usage_count >= promo.usage_limit) {
                return false;
            }
            return true;
        });

        console.log("[IProductRepository] getAutoApplyPromoCodes found:", validCodes.length);
        return validCodes;
    }


}
