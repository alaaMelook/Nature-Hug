import { supabase } from "@/data/datasources/supabase/client";
import { AdminRepository } from "@/domain/repositories/adminRepository";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { DashboardMetricsView } from "@/domain/entities/views/admin/dashboardMetricsView";
import { Material } from "@/domain/entities/database/material";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { Category } from "@/domain/entities/database/category";
import { Review } from "@/domain/entities/database/review";
import { ReviewAdminView } from "@/domain/entities/views/admin/reviewAdminView";

export class IAdminClientRepository implements AdminRepository {
    async createCategory(category: Partial<Category>): Promise<void> {
        console.log("[IAdminRepository] createCategory called with category:", category);
        const { data, status, statusText, error } = await supabase.schema('admin')
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
        const { data, status, statusText, error } = await supabase.schema('admin')
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

    async getDashboardMetrics(): Promise<DashboardMetricsView> {
        console.log("[IAdminRepository] getDashboardMetrics called.");
        const { data, status, statusText, error } = await supabase.schema('admin')
            .from("monthly_stats_view")
            .select('*')
            .single();
        console.log("[IAdminRepository] getDashboardMetrics result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] getDashboardMetrics error:", error);
            throw error;
        }
        return data as DashboardMetricsView;
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

    async deleteProduct(slug: string): Promise<void> {
        console.log("[IAdminRepository] deleteProduct called with slug:", slug);
        const { data, status, statusText, error } = await supabase.schema('store')
            .from('products')
            .delete()
            .eq('slug', slug);
        console.log("[IAdminRepository] deleteProduct result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] deleteProduct error:", error);
            throw error;
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
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from("product-images")
            .upload(fileName, file, { contentType: file.type });

        console.log("[IProductRepository] uploadImage result:", { data });
        if (error) {
            console.error("[IProductRepository] uploadImage error:", error);
            throw error;
        }

        const { data: urlData } = supabase.storage
            .from("product-images")
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

        const { data, error } = await supabase.storage.from('product-images').list('');

        console.log('[IAdminRepository] getAllImages result:', { data });
        if (error) {
            console.error('[IAdminRepository] getAllImages error:', error);
            throw error;
        }

        const images: { image: any, url: string }[] = [];
        if (data && Array.isArray(data)) {
            for (const item of data) {
                const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(item.name);
                if (urlData?.publicUrl) {
                    images.push({ image: item, url: urlData.publicUrl });
                }
            }
        }

        return images;
    }
    async deleteImage(imageName: string): Promise<void> {
        console.log('[IAdminRepository] deleteImage called with imageName:', imageName);

        const { data, error } = await supabase.storage.from('product-images').remove([imageName]);

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
}
