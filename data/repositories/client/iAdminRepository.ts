import { supabase } from "@/data/datasources/supabase/client";
import { AdminRepository } from "@/domain/repositories/adminRepository";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { DashboardStats } from "@/domain/entities/views/admin/dashboardMetricsView";
import { Material } from "@/domain/entities/database/material";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { Category } from "@/domain/entities/database/category";
import { Review } from "@/domain/entities/database/review";
import { ReviewAdminView } from "@/domain/entities/views/admin/reviewAdminView";
import { Governorate } from "@/domain/entities/database/governorate";

export class IAdminClientRepository implements AdminRepository {
    async toggleProductVisibility(id: number, isVariant: boolean, visible: boolean): Promise<void> {
        console.log("[IAdminRepository] toggleProductVisibility called with id:", id);
        const table = isVariant ? 'product_variants' : 'products';
        const { data, status, statusText, error } = await supabase.schema('store')
            .from(table)
            .update({ is_visible: visible })
            .eq('id', id);
        console.log("[IAdminRepository] toggleProductVisibility result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] toggleProductVisibility error:", error);
            throw error;
        }
    }
    async getAllGovernorates(): Promise<Governorate[]> {
        console.log("[IAdminRepository] getAllGovernorates called.");
        const { data, status, statusText, error } = await supabase.schema('store')
            .from('shipping_governorates')
            .select('*')
            .order('name_en', { ascending: true });
        console.log("[IAdminRepository] getAllGovernorates result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] getAllGovernorates error:", error);
            throw error;
        }
        return data || [];
    }
    async updateGovernorateFees(slug: string, fees: number): Promise<void> {
        console.log("[IAdminRepository] updateGovernorateFees called with slug:", slug);
        const { data, status, statusText, error } = await supabase.schema('store')
            .from('shipping_governorates')
            .update({ fees })
            .eq('slug', slug);
        console.log("[IAdminRepository] updateGovernorateFees result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] updateGovernorateFees error:", error);
            throw error;
        }
    }
    async createCategory(category: Partial<Category>): Promise<void> {
        console.log("[IAdminRepository] createCategory called with category:", category);
        const { data, status, statusText, error } = await supabase.schema('store')
            .from("categories")
            .insert(category);
        console.log("[IAdminRepository] createCategory result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] createCategory error:", error);
            throw error;
        }
    }
    async deleteCategory(id: number): Promise<void> {
        console.log("[IAdminRepository] deleteCategory called with id:", id);
        const { data, status, statusText, error } = await supabase.schema('store')
            .from("categories")
            .delete()
            .eq('id', id);
        console.log("[IAdminRepository] deleteCategory result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] deleteCategory error:", error);
            throw error;
        }
    }
    async getOrderDetails(): Promise<OrderDetailsView[]> {
        console.log("[IAdminRepository] getOrderDetails called.");
        const { data, status, statusText, error } = await supabase.schema('admin')
            .from("order_details")
            .select('*')
            .order("order_date", { ascending: false })
        console.log("[IAdminRepository] getOrderDetails result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] getOrderDetails error:", error);
            throw error;
        }
        return data || [];
    }

    async getDashboardMetrics(startDate: string,
        endDate: string
    ): Promise<DashboardStats> {
        console.log("[IAdminRepository] getDashboardMetrics called.");
        const { data, status, statusText, error } = await supabase.schema('admin')
            .rpc('get_dashboard_stats', { p_start_date: startDate, p_end_date: endDate })
            .single();
        console.log("[IAdminRepository] getDashboardMetrics result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] getDashboardMetrics error:", error);
            throw error;
        }
        return data as DashboardStats;
    }

    async getAllMaterials(): Promise<Material[]> {
        console.log("[IAdminRepository] getAllMaterials called.");
        const { data, status, statusText, error } = await supabase.schema('admin')
            .from("materials")
            .select('*');
        console.log("[IAdminRepository] getAllMaterials result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] getAllMaterials error:", error);
            throw error;
        }
        return data || [];
    }

    async addMaterial(material: Material): Promise<void> {
        console.log("[IAdminRepository] addMaterial called with material:", material);
        const { data, status, statusText, error } = await supabase.schema('admin')
            .from("materials")
            .insert(material);
        console.log("[IAdminRepository] addMaterial result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] addMaterial error:", error);
            throw error;
        }
    }

    async updateMaterial(material: Partial<Material>): Promise<void> {
        console.log("[IAdminRepository] updateMaterial called with material:", material);
        const { id, ...updateData } = material as Partial<Material>;
        if (!id) {
            console.error("[IAdminRepository] updateMaterial error: material id is required");
            throw new Error("material id is required");
        }

        const { data, status, statusText, error } = await supabase.schema('admin')
            .from("materials")
            .update(updateData)
            .eq('id', id);

        console.log("[IAdminRepository] updateMaterial result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] updateMaterial error:", error);
            throw error;
        }
    }

    async deleteMaterial(id: number): Promise<void> {
        console.log("[IAdminRepository] deleteMaterial called with id:", id);
        const { data, status, statusText, error } = await supabase.schema('admin')
            .from("materials")
            .delete()
            .eq('id', id);
        console.log("[IAdminRepository] deleteMaterial result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] deleteMaterial error:", error);
            throw error;
        }
    }

    async createProduct(product: ProductAdminView): Promise<number> {
        console.log("[IAdminRepository] createProduct called with product:", product);
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('admin').rpc('create_product', { product_data: product });
        console.log("[IAdminRepository] createProduct result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] createProduct error:", error);
            throw error;
        }
        return data;
    }

    async updateProduct(product: ProductAdminView): Promise<number> {
        console.log("[IAdminRepository] updateProduct called with product:", product);
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('admin').rpc('update_product', { product_data: product });
        console.log("[IAdminRepository] updateProduct result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] updateProduct error:", error);
            throw error;
        }
        return data;
    }

    async deleteProduct(product: ProductAdminView): Promise<void> {
        console.log("[IAdminRepository] deleteProduct called with slug:", product.slug);
        const table = product.variant_id ? 'product_variants' : 'products';
        const { data, status, statusText, error } = await supabase.schema('store')
            .from(table)
            .delete()
            .eq('slug', product.slug);
        console.log("[IAdminRepository] deleteProduct result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] deleteProduct error:", error);
            throw error;
        }
        if (product.variant_id && product.variants.length <= 1) {
            const {
                data,
                status,
                statusText,
                error
            } = await supabase.schema('store').from('products').delete().eq('id', product.product_id);
            console.log("[IAdminRepository] deleteProduct result:", { data, status, statusText });
            if (error) {
                console.error("[IAdminRepository] deleteProduct error:", error);
                throw error;
            }
        }
    }

    async viewAllWithDetails(): Promise<ProductAdminView[]> {
        console.log("[IAdminRepository] viewAllWithDetails called.");
        const { data, status, statusText, error } = await supabase.schema('store').from(`product_detail`).select('*');
        console.log("[IAdminRepository] viewAllWithDetails result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] viewAllWithDetails error:", error);
            throw error;
        }
        return data || [];
    }

    async uploadImage(file: File): Promise<string> {
        console.log("[IProductRepository] uploadImage called with file:", file.name)
        const fileExt = file.name.split(".").pop();
        const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from("nature-hug")
            .upload(fileName, file, { contentType: file.type });

        console.log("[IProductRepository] uploadImage result:", { data });
        if (error) {
            console.error("[IProductRepository] uploadImage error:", error);
            throw error;
        }

        const { data: urlData } = supabase.storage
            .from("nature-hug")
            .getPublicUrl((data as any).path);

        console.log("[IProductRepository] getPublicUrl result:", { urlData });
        if (!urlData) {
            console.error("[IProductRepository] getPublicUrl error: Failed to get public url");
            throw new Error('Failed to get public url');
        }

        return urlData.publicUrl;
    }

    async updateOrder(order: OrderDetailsView) {
        console.log("[IAdminRepository] updateOrder called with order:", order);
        const {
            data,
            status,
            statusText,
            error,
        } = await supabase.schema('store').from('orders').update({ status: order.order_status }).eq('id', order.order_id);
        if (error) {
            console.error("[IAdminRepository] updateOrder error:", error);
            throw error;
        }
        console.log("[IAdminRepository] updateOrder result:", { data, status, statusText });

    }
    async getAllImages(): Promise<{ image: any, url: string }[]> {
        console.log('[IAdminRepository] getAllImages called.');

        const { data, error } = await supabase.storage.from('nature-hug').list('products', {
            sortBy: {
                column: 'created_at', // Use 'created_at' for the added date/time
                order: 'desc',        // Use 'desc' for newest items first (descending)
            },
        });

        console.log('[IAdminRepository] getAllImages result:', { data });
        if (error) {
            console.error('[IAdminRepository] getAllImages error:', error);
            throw error;
        }

        const images: { image: any, url: string }[] = [];
        if (data && Array.isArray(data)) {
            for (const item of data) {
                const { data: urlData } = supabase.storage.from('nature-hug').getPublicUrl('products/' + item.name);
                if (urlData?.publicUrl) {
                    images.push({ image: item, url: urlData.publicUrl });
                }
            }
        }

        return images;
    }
    async deleteImage(imageName: string): Promise<void> {
        console.log('[IAdminRepository] deleteImage called with imageName:', imageName);

        const { data, error } = await supabase.storage.from('nature-hug').remove(['products/' + imageName]);

        console.log('[IAdminRepository] deleteImage result:', { data });
        if (error) {
            console.error('[IAdminRepository] deleteImage error:', error);
            throw error;
        }
    }
    async seeAllReviews(): Promise<ReviewAdminView[]> {
        console.log("[IAdminRepository] seeAllReviews called.");

        const { data, error, status, statusText } = await supabase
            .from('store.reviews')
            .select('*, products(name), customers(first_name, last_name)');

        console.log("[IAdminRepository] seeAllReviews result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] seeAllReviews error:", error);
            throw error;
        }

        return (data || []).map((review: any) => ({
            ...review,
            product_name: review.products?.name || 'Unknown Product',
            customer_name: `${review.customers?.first_name || ''} ${review.customers?.last_name || ''}`.trim() || 'Unknown Customer'
        }));
    }

    async updateReviewStatus(reviewId: number, status: 'approved' | 'rejected' | 'pending'): Promise<void> {
        console.log(`[IAdminClientRepository] updateReviewStatus called for review ${reviewId} with status ${status}`);
        const { error } = await supabase
            .from('store.reviews')
            .update({ status })
            .eq('id', reviewId);

        if (error) {
            console.error("[IAdminClientRepository] updateReviewStatus error:", error);
            throw error;
        }
    }

    async getAllPromoCodes(): Promise<any[]> {
        console.log("[IAdminClientRepository] getAllPromoCodes called.");
        const { data, error } = await supabase.schema('store').from('promo_codes').select('*');
        if (error) {
            console.error("[IAdminClientRepository] getAllPromoCodes error:", error);
            throw error;
        }
        return data || [];
    }

    async createPromoCode(promoCode: any): Promise<void> {
        console.log("[IAdminClientRepository] createPromoCode called with:", promoCode);
        const { error } = await supabase.schema('store').from('promo_codes').insert(promoCode);
        if (error) {
            console.error("[IAdminClientRepository] createPromoCode error:", error);
            throw error;
        }
    }

    async deletePromoCode(id: number): Promise<void> {
        console.log("[IAdminClientRepository] deletePromoCode called with id:", id);
        const { error } = await supabase.schema('store').from('promo_codes').delete().eq('id', id);
        if (error) {
            console.error("[IAdminClientRepository] deletePromoCode error:", error);
            throw error;
        }
    }
}
