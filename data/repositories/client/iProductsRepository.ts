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

        if (!data || data.length === 0) {
            return [];
        }

        // Fetch category names for all products from junction table
        // Use product_id if available, otherwise fall back to id
        const productIds = [...new Set(data.map((p: any) => p.product_id || p.id))];

        // Step 1: Get product-category links (simple query, no join)
        const { data: productCategoryLinks, error: pcError } = await supabase.schema('store')
            .from('product_categories')
            .select('product_id, category_id')
            .in('product_id', productIds);

        if (pcError) {
            console.error("[IProductRepository] viewAll - productCategories error:", pcError);
        }

        // Step 2: Get all categories
        const categoryIds = [...new Set((productCategoryLinks || []).map(pc => pc.category_id))];
        let categoriesMap: Record<number, { name_en: string; name_ar: string }> = {};

        if (categoryIds.length > 0) {
            const { data: categoriesData } = await supabase.schema('store')
                .from('categories')
                .select('id, name_en, name_ar')
                .in('id', categoryIds);

            for (const cat of (categoriesData || [])) {
                categoriesMap[cat.id] = { name_en: cat.name_en, name_ar: cat.name_ar };
            }
        }

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

        // Attach category_names to each product
        return data.map((product: any) => ({
            ...product,
            product_id: product.product_id || product.id,
            category_names: categoryNamesMap[product.product_id || product.id] || []
        }));
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
        const isAr = this.lang === 'ar';

        // 1. Try products table first
        let product: any = null;
        let productId: number | null = null;
        let variantId: number | null = null;

        const { data: productData } = await supabase.schema('store')
            .from('products')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (productData) {
            product = productData;
            productId = productData.id;
        } else {
            const { data: variantData } = await supabase.schema('store')
                .from('product_variants')
                .select('*, products!inner(*)')
                .eq('slug', slug)
                .maybeSingle();

            if (variantData) {
                variantId = variantData.id;
                productId = variantData.product_id;
                product = { ...variantData.products, _variant: variantData };
            }
        }

        if (!product || !productId) {
            throw { code: 'NOT_FOUND', message: `Product not found: ${slug}` };
        }

        // 2. Get variants
        const { data: variants } = await supabase.schema('store')
            .from('product_variants')
            .select('id, name_en, name_ar, price, stock, slug, type_en, type_ar')
            .eq('product_id', productId);

        // 3. Get reviews
        const { data: reviews } = await supabase.schema('store')
            .from('reviews')
            .select('id, rating, comment, created_at, customer_id, status, customers(name, governorate)')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        // 4. Get materials
        const materialKey = variantId ? 'variant_id' : 'product_id';
        const materialKeyValue = variantId || productId;
        const { data: materialsUsed } = await supabase.schema('store')
            .from('materials_used')
            .select('id, grams_used, measurement_unit, material_id')
            .eq(materialKey, materialKeyValue);

        let materialsData: any[] = [];
        if (materialsUsed && materialsUsed.length > 0) {
            const matIds = materialsUsed.map((m: any) => m.material_id);
            const { data: mats } = await supabase.schema('admin')
                .from('materials')
                .select('id, name, material_type')
                .in('id', matIds);
            materialsData = mats || [];
        }

        // 5. Get category
        const { data: catLinks } = await supabase.schema('store')
            .from('product_categories')
            .select('category_id, categories(name_en, name_ar)')
            .eq('product_id', productId)
            .limit(1);

        // 6. Avg rating
        const approvedReviews = (reviews || []).filter((r: any) => r.status === 'approved');
        const avgRating = approvedReviews.length > 0
            ? Math.round((approvedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / approvedReviews.length) * 10) / 10
            : 0;

        const source = product._variant || product;

        return {
            product_id: productId,
            variant_id: variantId || undefined,
            name: isAr ? (source.name_ar || product.name_ar || '') : (source.name_en || product.name || ''),
            description: isAr ? (source.description_ar || product.description_ar || '') : (source.description_en || product.description || ''),
            price: source.price || product.price || 0,
            stock: source.stock || product.stock || 0,
            discount: source.discount || product.discount || 0,
            image: source.image || product.image_url || '',
            category_name: catLinks?.[0]?.categories
                ? (isAr ? (catLinks[0].categories as any).name_ar : (catLinks[0].categories as any).name_en)
                : null,
            skin_type: product.skin_type || null,
            type: isAr ? (source.type_ar || product.product_type || '') : (source.type_en || product.product_type || ''),
            slug: source.slug || product.slug,
            product_type: product.product_type || null,
            highlight: isAr ? (product.highlight_ar || '') : (product.highlight_en || ''),
            faq: isAr ? (product.faq_ar || {}) : (product.faq_en || {}),
            created_at: source.created_at || product.created_at,
            gallery: source.gallery || product.gallery || [],
            variants: (variants || []).map((v: any) => ({
                id: v.id,
                name: isAr ? (v.name_ar || '') : (v.name_en || ''),
                price: v.price || 0,
                stock: v.stock || 0,
                slug: v.slug || '',
                type: isAr ? (v.type_ar || '') : (v.type_en || ''),
            })),
            reviews: (reviews || []).map((r: any) => ({
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                created_at: r.created_at,
                customer_name: r.customers?.name || null,
                customer_governorate: r.customers?.governorate || null,
                customer_id: r.customer_id,
                status: r.status,
            })),
            materials: (materialsUsed || []).map((mu: any) => {
                const mat = materialsData.find((m: any) => m.id === mu.material_id);
                return {
                    id: mu.id,
                    material_name: mat?.name || 'Unknown',
                    grams_used: mu.grams_used,
                    measurement_unit: mu.measurement_unit,
                    material_type: mat?.material_type || null,
                };
            }),
            avg_rating: avgRating,
        } as ProductDetailView;
    }

    async viewByCategory(categoryName: string): Promise<ProductView[]> {
        console.log("[IProductRepository] viewByCategory called with categoryName:", categoryName);

        // First, get the category ID by name
        const categoryColumn = this.lang === 'ar' ? 'name_ar' : 'name_en';
        const { data: categoryData } = await supabase.schema('store')
            .from('categories')
            .select('id')
            .eq(categoryColumn, categoryName)
            .single();

        if (!categoryData) {
            console.log("[IProductRepository] Category not found:", categoryName);
            return [];
        }

        // Get product IDs that have this category
        const { data: productCategoryLinks } = await supabase.schema('store')
            .from('product_categories')
            .select('product_id')
            .eq('category_id', categoryData.id);

        const productIds = (productCategoryLinks || []).map(pc => pc.product_id);

        if (productIds.length === 0) {
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
