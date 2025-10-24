import { Order } from "@/domain/entities/database/order";
import { supabase } from "@/data/datasources/supabase/client";
import { AdminRepository } from "@/domain/repositories/adminRepository";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { DashboardMetricsView } from "@/domain/entities/views/admin/dashboardMetricsView";
import { Material } from "@/domain/entities/database/material";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";

export class IAdminRepository implements AdminRepository {
    // Get total customers
    async getOrderDetails(): Promise<OrderDetailsView[]> {
        const { data, error } = await supabase.schema('admin')
            .from("order_details")
            .select('*')
            .order("order_date", { ascending: false })
            .limit(5);
        if (error) console.error(error);
        return data || [];
    }
    async getDashboardMetrics(): Promise<DashboardMetricsView> {
        const { data, error } = await supabase.schema('admin')
            .from("monthly_stats_view")
            .select('*')
            .single();
        if (error) console.error(error);
        return data as DashboardMetricsView;
    }
    async getAllMaterials(): Promise<Material[]> {
        const { data, error } = await supabase.schema('admin')
            .from("materials")
            .select('*');
        if (error) console.error(error);
        return data || [];
    }
    async addMaterial(material: Material): Promise<void> {
        const { error } = await supabase.schema('admin')
            .from("materials")
            .insert(material);
        if (error) console.error(error);
    }
    async deleteMaterial(id: number): Promise<void> {
        const { error } = await supabase.schema('admin')
            .from("materials")
            .delete()
            .eq('id', id);
        if (error) console.error(error);
    }
    async createProduct(product: ProductAdminView): Promise<number> {
        try {
            const { data, error } = await supabase.schema('admin').rpc('create_product', { product_data: product });
            if (error) console.error(error);
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    async updateProduct(product: ProductAdminView): Promise<number> {
        try {
            const { data, error } = await supabase.schema('admin').rpc('update_product', { product_data: product });
            if (error) console.error(error);
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    async deleteProduct(slug: string): Promise<void> {
        try {
            const { error } = await supabase.schema('store').from('products').delete().eq('slug', slug);
            if (error) throw error
        } catch (error) {
            console.error(error);
        }
    }
    async viewAllWithDetails(): Promise<ProductAdminView[]> {
        try {
            const { data, error } = await supabase.schema('store').from(`product_detail`).select('*');
            if (error) console.error(error);
            return data || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }
}

