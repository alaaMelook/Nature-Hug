import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { AdminRepository } from "@/domain/repositories/adminRepository";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { DashboardMetricsView } from "@/domain/entities/views/admin/dashboardMetricsView";
import { Material } from "@/domain/entities/database/material";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { Category } from "@/domain/entities/database/category";
import { ReviewAdminView } from "@/domain/entities/views/admin/reviewAdminView";
import { PromoCode } from "@/domain/entities/database/promoCode";

export class IAdminServerRepository implements AdminRepository {
    async getOrderDetails(): Promise<OrderDetailsView[]> {
        console.log("[IAdminRepository] getOrderDetails called.");
        const { data, status, statusText, error } = await supabaseAdmin.schema('admin')
            .rpc("select_from_view", { view_name: 'order_details' })


        console.log("[IAdminRepository] getOrderDetails result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] getOrderDetails error:", error);
            throw error;
        }
        return data || [];
    }

    async getOrderById(id: string): Promise<OrderDetailsView | null> {
        console.log(`[IAdminRepository] getOrderById called for id: ${id}`);
        // Try to filter the view directly if possible, otherwise fetch all and find (fallback)
        // Assuming we can query the view directly as we are admin
        const { data, error } = await supabaseAdmin.schema('admin')
            .from('order_details')
            .select('*')
            .eq('order_id', id)
            .single();

        if (error) {
            console.error("[IAdminRepository] getOrderById error:", error);
            // Fallback: fetch all and find
            // const all = await this.getOrderDetails();
            // return all.find(o => o.order_id.toString() === id) || null;
            throw error;
        }
        return data;
    }

    async getDashboardMetrics(): Promise<DashboardMetricsView> {
        console.log("[IAdminRepository] getDashboardMetrics called.");

        const { data, status, statusText, error } = await supabaseAdmin.schema('admin')
            .rpc('select_from_view', { view_name: 'monthly_stats_view' })

        console.log("[IAdminRepository] getDashboardMetrics result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] getDashboardMetrics error:", error);
            throw error;
        }
        return data[0] as DashboardMetricsView;
    }

    async getAllMaterials(): Promise<Material[]> {
        console.log("[IAdminRepository] getAllMaterials called.");

        const { data, status, statusText, error } = await supabaseAdmin.schema('admin')
            .from("materials")
            .select('*');

        console.log("[IAdminRepository] getAllMaterials result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] getAllMaterials error:", error);
            throw error;
        }
        return data || [];
    }

    async addMaterial(material: Partial<Material>): Promise<void> {
        console.log("[IAdminRepository] addMaterial called with material:", material);

        const { data, status, statusText, error } = await supabaseAdmin.schema('admin')
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
        const { id, ...updateData } = material;
        if (!material.id) {
            console.error("[IAdminRepository] updateMaterial error: material id is required");
            throw new Error("material id is required");
        }

        const { data, status, statusText, error } = await supabaseAdmin.schema('admin')
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

        const { data, status, statusText, error } = await supabaseAdmin.schema('admin')
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


        // Deduct materials from stock
        try {
            const materialsToUpdate = new Map<number, number>();

            // Helper to accumulate usage
            const addUsage = (matId: number, amountPerUnit: number, units: number) => {
                const total = amountPerUnit * units;
                const current = materialsToUpdate.get(matId) || 0;
                materialsToUpdate.set(matId, current + total);
            };

            // 1. Main Product Materials
            if (product.stock > 0 && product.materials) {
                for (const mat of product.materials) {
                    addUsage(mat.id, (mat.grams_used || 0), product.stock);
                }
            }

            // 2. Variant Materials
            if (product.variants) {
                for (const variant of product.variants) {
                    if (variant.stock > 0 && variant.materials) {
                        for (const mat of variant.materials) {
                            addUsage(mat.id, (mat.grams_used || 0), variant.stock);
                        }
                    }
                }
            }

            // 3. Perform Updates
            if (materialsToUpdate.size > 0) {
                console.log("[IAdminRepository] Deducting materials:", Object.fromEntries(materialsToUpdate));

                // Fetch current stocks for involved materials
                const { data: currentMaterials, error: fetchError } = await supabaseAdmin.schema('admin')
                    .from("materials")
                    .select('id, stock_grams')
                    .in('id', Array.from(materialsToUpdate.keys()));

                if (fetchError) {
                    console.error("[IAdminRepository] Error fetching materials for deduction:", fetchError);
                } else if (currentMaterials) {
                    for (const mat of currentMaterials) {
                        const deduction = materialsToUpdate.get(mat.id) || 0;
                        const newStock = Math.max(0, (mat.stock_grams || 0) - deduction);

                        await supabaseAdmin.schema('admin')
                            .from("materials")
                            .update({ stock_grams: newStock })
                            .eq('id', mat.id);
                    }
                }
            }
            const {
                data,
                status,
                statusText,
                error
            } = await supabaseAdmin.schema('admin').rpc('create_product', { product_data: product });

            console.log("[IAdminRepository] createProduct result:", { data, status, statusText });

            if (error) {
                console.error("[IAdminRepository] createProduct error:", error);
                throw error;
            }
            return data;

        } catch (deductionError) {
            console.error("[IAdminRepository] Error deducting material stock:", deductionError);
            throw deductionError;
            // We don't throw here to avoid failing the product creation if stock deduction fails, 
            // but in a real app we might want a transaction or compensation action.
        }


    }

    async updateProduct(product: ProductAdminView): Promise<number> {
        console.log("[IAdminRepository] updateProduct called with product:", product);

        const {
            data,
            status,
            statusText,
            error
        } = await supabaseAdmin.schema('admin').rpc('update_product', { product_data: product });

        console.log("[IAdminRepository] updateProduct result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] updateProduct error:", error);
            throw error;
        }
        return data;
    }

    async deleteProduct(slug: string): Promise<void> {
        console.log("[IAdminRepository] deleteProduct called with slug:", slug);

        const {
            data,
            status,
            statusText,
            error
        } = await supabaseAdmin.schema('store').from('products').delete().eq('slug', slug);

        console.log("[IAdminRepository] deleteProduct result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] deleteProduct error:", error);
            throw error;
        }
    }
    async createCategory(category: Partial<Category>): Promise<void> {
        console.log("[IProductRepository] createCategory called with:", category);
        const { error } = await supabaseAdmin.schema('store').from('categories').insert(category);
        if (error) {
            console.error("[IProductRepository] createCategory error:", error);
            throw error;
        }
    }

    async deleteCategory(id: number): Promise<void> {
        console.log("[IProductRepository] deleteCategory called with id:", id);
        const { error } = await supabaseAdmin.schema('store').from('categories').delete().eq('id', id);
        if (error) {
            console.error("[IProductRepository] deleteCategory error:", error);
            throw error;
        }
    }

    async viewAllWithDetails(): Promise<ProductAdminView[]> {
        console.log("[IAdminRepository] viewAllWithDetails called.");

        const {
            data,
            status,
            statusText,
            error
        } = await supabaseAdmin.schema('store').from('product_detail').select('*');

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

        const { data, error } = await supabaseAdmin.storage
            .from("product-images")
            .upload(fileName, file, { contentType: file.type });

        console.log("[IProductRepository] uploadImage result:", { data });
        if (error) {
            console.error("[IProductRepository] uploadImage error:", error);
            throw error;
        }
        if (data == null) {
            console.error('[IProductRepository] no data returned from upload');
            return '';
        }
        const { data: urlData } = supabaseAdmin.storage
            .from("product-images")
            .getPublicUrl((data as any).path);

        console.log("[IProductRepository] getPublicUrl result:", { urlData });
        if (!urlData || !urlData.publicUrl) {
            const err = new Error('Failed to get public URL from storage');
            console.error('[IProductRepository] getPublicUrl error:', err);
            throw err;
        }

        console.log("[IProductRepository] Image uploaded successfully, URL:", urlData?.publicUrl);
        return urlData?.publicUrl || '';

    }

    async updateOrder(order: Partial<OrderDetailsView>) {
        console.log("[IAdminRepository] updateOrder called with order:", order);
        const updateData: any = { status: order.order_status };
        if (order.shipment_id) updateData.shipment_id = order.shipment_id;
        if (order.awb) updateData.awb = order.awb;

        const {
            data,
            status,
            statusText,
            error,
        } = await supabaseAdmin.schema('store').from('orders').update(updateData).eq('id', order.order_id);
        console.log("[IAdminRepository] updateOrder result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] updateOrder error:", error);
            throw error;
        }
    }
    async getAllImages(): Promise<{ image: any, url: string }[]> {
        console.log("[IAdminRepository] getAllImages called.");

        const { data, error } = await supabaseAdmin.storage.from('product-images').list('');

        console.log("[IAdminRepository] getAllImages result:", { data });
        if (error) {
            console.error("[IAdminRepository] getAllImages error:", error);
            throw error;
        }

        const images: { image: any, url: string }[] = [];
        if (data && Array.isArray(data)) {
            for (const item of data) {
                const { data: urlData } = supabaseAdmin.storage.from('product-images').getPublicUrl(item.name);
                if (urlData?.publicUrl) {
                    images.push({ image: item, url: urlData.publicUrl });
                }
            }
        }

        return images;
    }
    async deleteImage(imageName: string): Promise<void> {
        console.log("[IAdminRepository] deleteImage called with imageName:", imageName);

        const { data, error } = await supabaseAdmin.storage.from('product-images').remove([imageName]);

        console.log("[IAdminRepository] deleteImage result:", { data });
        if (error) {
            console.error("[IAdminRepository] deleteImage error:", error);
            throw error;
        }
    }
    async seeAllReviews(): Promise<ReviewAdminView[]> {
        console.log("[IAdminRepository] seeAllReviews called.");

        const { data, error, status, statusText } = await supabaseAdmin.schema('admin')
            .rpc("select_from_view", { view_name: 'all_reviews' })

        console.log("[IAdminRepository] seeAllReviews result:", { data, status, statusText });
        if (error) {
            console.error("[IAdminRepository] seeAllReviews error:", error);
            throw error;
        }

        return (data || []);
    }

    async updateReviewStatus(reviewId: number, status: 'approved' | 'rejected' | 'pending'): Promise<void> {
        console.log(`[IAdminRepository] updateReviewStatus called for review ${reviewId} with status ${status}`);
        const { error } = await supabaseAdmin.schema('store')
            .from('reviews')
            .update({ status })
            .eq('id', reviewId);

        if (error) {
            console.error("[IAdminRepository] updateReviewStatus error:", error);
            throw error;
        }
    }

    async addMaterialStock(material: Material, amount: number): Promise<void> {
        console.log(`[IAdminRepository] addMaterialStock called for id: ${material.id}, amount: ${amount}`);

        // 2. Update stock
        const newStock = (material.stock_grams || 0) + amount;
        const { error: updateError } = await supabaseAdmin.schema('admin')
            .from("materials")
            .update({ stock_grams: newStock })
            .eq('id', material.id);

        if (updateError) {
            console.error("[IAdminRepository] addMaterialStock update error:", updateError);
            throw updateError;
        }
    }

    async addProductStock(product: ProductAdminView, quantity: number): Promise<void> {
        console.log(`[IAdminRepository] addProductStock called for productId: ${product.product_id}, quantity: ${quantity}`);


        // Main product materials
        let materialsNeeded = product.materials.map(m => ({
            material_id: m.id,
            amount: (m.grams_used || 0) * quantity
        }));


        if (materialsNeeded.length === 0) {
            // No materials needed, just update stock
            console.log("[IAdminRepository] No materials linked, updating stock directly.");
        } else {
            // 3. Check Material Availability
            console.log("[IAdminRepository] Checking material availability:", materialsNeeded);
            const materialIds = materialsNeeded.map(m => m.material_id);
            const { data: currentMaterials, error: matError } = await supabaseAdmin.schema('admin')
                .from("materials")
                .select('id, stock_grams, name')
                .in('id', materialIds);

            if (matError) throw matError;

            for (const need of materialsNeeded) {
                const mat = currentMaterials?.find(m => m.id === need.material_id);
                if (!mat) throw new Error(`Material ID ${need.material_id} not found`);

                if ((mat.stock_grams || 0) < need.amount) {
                    throw new Error(`Insufficient stock for material: ${mat.name}. Required: ${need.amount}, Available: ${mat.stock_grams}`);
                }
            }
            console.log("[IAdminRepository] Material availability checked successfully.");
            // 4. Deduct Materials
            console.log("[IAdminRepository] Deducting materials:", materialsNeeded);
            for (const need of materialsNeeded) {
                const mat = currentMaterials?.find(m => m.id === need.material_id)!;
                const newStock = (mat.stock_grams || 0) - need.amount;
                console.log("[IAdminRepository] Deducting material:", mat.name, "New stock:", newStock);
                const { error: deductError } = await supabaseAdmin.schema('admin')
                    .from("materials")
                    .update({ stock_grams: newStock })
                    .eq('id', mat.id);

                if (deductError) throw deductError;
            }
            console.log("[IAdminRepository] Materials deducted successfully.");
        }

        // 5. Update Product/Variant Stock
        if (product.variant_id) {
            const { error: updateError } = await supabaseAdmin.schema('store')
                .from('product_variants')
                .update({ stock: (product.stock || 0) + quantity })
                .eq('id', product.variant_id);
            if (updateError) throw updateError;
        } else {
            const { error: updateError } = await supabaseAdmin.schema('store')
                .from('products')
                .update({ stock: (product.stock || 0) + quantity })
                .eq('id', product.product_id);
            if (updateError) throw updateError;
        }
        console.log("[IAdminRepository] Product/Variant stock updated successfully.");
    }
    async getAllPromoCodes(): Promise<PromoCode[]> {
        console.log("[IAdminRepository] getAllPromoCodes called.");
        const { data, error } = await supabaseAdmin.schema('store')
            .from('promo_codes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("[IAdminRepository] getAllPromoCodes error:", error);
            throw error;
        }
        return data || [];
    }

    async createPromoCode(promoCode: Partial<PromoCode>): Promise<void> {
        console.log("[IAdminRepository] createPromoCode called with:", promoCode);
        const { error } = await supabaseAdmin.schema('store')
            .from('promo_codes')
            .insert(promoCode);

        if (error) {
            console.error("[IAdminRepository] createPromoCode error:", error);
            throw error;
        }
    }

    async deletePromoCode(id: number): Promise<void> {
        console.log("[IAdminRepository] deletePromoCode called with id:", id);
        const { error } = await supabaseAdmin.schema('store')
            .from('promo_codes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("[IAdminRepository] deletePromoCode error:", error);
            throw error;
        }
    }

    async updatePromoCode(promoCode: Partial<PromoCode>): Promise<void> {
        console.log("[IAdminRepository] updatePromoCode called with:", promoCode);
        const { id, ...updates } = promoCode;
        if (!id) throw new Error("Promo code ID is required for update");

        const { error } = await supabaseAdmin.schema('store')
            .from('promo_codes')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error("[IAdminRepository] updatePromoCode error:", error);
            throw error;
        }
    }
}
