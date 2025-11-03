import {supabase} from "@/data/datasources/supabase/client";
import {AdminRepository} from "@/domain/repositories/adminRepository";
import {OrderDetailsView} from "@/domain/entities/views/admin/orderDetailsView";
import {DashboardMetricsView} from "@/domain/entities/views/admin/dashboardMetricsView";
import {Material} from "@/domain/entities/database/material";
import {ProductAdminView} from "@/domain/entities/views/admin/productAdminView";

export class IAdminClientRepository implements AdminRepository {
    async getOrderDetails(): Promise<OrderDetailsView[]> {
        try {
            console.log("[IAdminRepository] getOrderDetails called.");
            const {data} = await supabase.schema('admin')
                .from("order_details")
                .select('*')
                .order("order_date", {ascending: false})
                .limit(5);
            console.log("[IAdminRepository] getOrderDetails result:", data);
            return data || [];
        } catch (error) {
            console.error("[IAdminRepository] Error in getOrderDetails:", error);
            throw error;
        }
    }

    async getDashboardMetrics(): Promise<DashboardMetricsView> {
        try {
            console.log("[IAdminRepository] getDashboardMetrics called.");
            const {data} = await supabase.schema('admin')
                .from("monthly_stats_view")
                .select('*')
                .single();
            console.log("[IAdminRepository] getDashboardMetrics result:", data);
            return data as DashboardMetricsView;
        } catch (error) {
            console.error("[IAdminRepository] Error in getDashboardMetrics:", error);
            throw error;
        }
    }

    async getAllMaterials(): Promise<Material[]> {
        try {
            console.log("[IAdminRepository] getAllMaterials called.");
            const {data} = await supabase.schema('admin')
                .from("materials")
                .select('*');
            console.log("[IAdminRepository] getAllMaterials result:", data);
            return data || [];
        } catch (error) {
            console.error("[IAdminRepository] Error in getAllMaterials:", error);
            throw error;
        }
    }

    async addMaterial(material: Material): Promise<void> {
        try {
            console.log("[IAdminRepository] addMaterial called with material:", material);
            await supabase.schema('admin')
                .from("materials")
                .insert(material);
            console.log("[IAdminRepository] addMaterial completed.");
        } catch (error) {
            console.error("[IAdminRepository] Error in addMaterial:", error);
            throw error;
        }
    }

    async deleteMaterial(id: number): Promise<void> {
        try {
            console.log("[IAdminRepository] deleteMaterial called with id:", id);
            await supabase.schema('admin')
                .from("materials")
                .delete()
                .eq('id', id);
            console.log("[IAdminRepository] deleteMaterial completed.");
        } catch (error) {
            console.error("[IAdminRepository] Error in deleteMaterial:", error);
            throw error;
        }
    }

    async createProduct(product: ProductAdminView): Promise<number> {
        try {
            console.log("[IAdminRepository] createProduct called with product:", product);
            const {data} = await supabase.schema('admin').rpc('create_product', {product_data: product});
            console.log("[IAdminRepository] createProduct result:", data);
            return data;
        } catch (error) {
            console.error("[IAdminRepository] Error in createProduct:", error);
            throw error;
        }
    }

    async updateProduct(product: ProductAdminView): Promise<number> {
        try {
            console.log("[IAdminRepository] updateProduct called with product:", product);
            const {data} = await supabase.schema('admin').rpc('update_product', {product_data: product});
            console.log("[IAdminRepository] updateProduct result:", data);
            return data;
        } catch (error) {
            console.error("[IAdminRepository] Error in updateProduct:", error);
            throw error;
        }
    }

    async deleteProduct(slug: string): Promise<void> {
        try {
            console.log("[IAdminRepository] deleteProduct called with slug:", slug);
            await supabase.schema('store').from('products').delete().eq('slug', slug);
            console.log("[IAdminRepository] deleteProduct completed.");
        } catch (error) {
            console.error("[IAdminRepository] Error in deleteProduct:", error);
            throw error;
        }
    }

    async viewAllWithDetails(): Promise<ProductAdminView[]> {
        try {
            console.log("[IAdminRepository] viewAllWithDetails called.");
            const {data} = await supabase.schema('store').from(`product_detail`).select('*');
            console.log("[IAdminRepository] viewAllWithDetails result:", data);
            return data || [];
        } catch (error) {
            console.error("[IAdminRepository] Error in viewAllWithDetails:", error);
            throw error;
        }
    }

    async uploadImage(file: File): Promise<string> {
        try {
            console.log("[IProductRepository] uploadImage called with file:", file.name);
            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

            const {data, error} = await supabase.storage
                .from("product-images")
                .upload(fileName, file, {contentType: file.type});

            if (data == null) {
                console.error('[IProductRepository] no data returned from upload');
                return '';
            }
            const {data: url} = supabase.storage
                .from("product-images")
                .getPublicUrl(data.path);

            console.log("[IProductRepository] Image uploaded successfully, URL:", url.publicUrl);
            return url.publicUrl;

        } catch (error) {
            console.error("[IProductRepository] Error in ImageUpload:", error);
            throw error;
        }
    }
}
