import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { AdminRepository } from "@/domain/repositories/adminRepository";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { DashboardStats } from "@/domain/entities/views/admin/dashboardMetricsView";
import { Material } from "@/domain/entities/database/material";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { Category } from "@/domain/entities/database/category";
import { ReviewAdminView } from "@/domain/entities/views/admin/reviewAdminView";
import { PromoCode } from "@/domain/entities/database/promoCode";
import { Governorate } from "@/domain/entities/database/governorate";
import { AccountReportView, ProductSalesReport, ReportSummary } from "@/domain/entities/views/admin/reportViews";

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
            .maybeSingle();

        if (error) {
            console.error("[IAdminRepository] getOrderById error:", error);
            throw error;
        }

        // Return null if no order found (not an error, just not found)
        return data;
    }

    async getOrderByAwb(awb: string): Promise<OrderDetailsView | null> {
        console.log(`[IAdminRepository] getOrderByAwb called for awb: ${awb}`);
        const { data, error } = await supabaseAdmin.schema('admin')
            .from('order_details')
            .select('*')
            .eq('awb', awb)
            .maybeSingle();

        if (error) {
            console.error("[IAdminRepository] getOrderByAwb error:", error);
            throw error;
        }

        return data;
    }

    async getDashboardMetrics(startDate: string,
        endDate: string
    ): Promise<DashboardStats> {
        console.log("[IAdminRepository] getDashboardMetrics called.");
        const { data, status, statusText, error } = await supabaseAdmin.schema('admin')
            .rpc('get_dashboard_stats', { start_date: startDate, end_date: endDate })
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

        // 1. Update main product fields directly (avoids gallery type mismatch in RPC)
        // Also update legacy category_id for backwards compatibility with store views
        const primaryCategoryId = product.category_ids && product.category_ids.length > 0
            ? product.category_ids[0]
            : null;

        const { error: productError } = await supabaseAdmin.schema('store')
            .from('products')
            .update({
                name_en: product.name_en,
                name_ar: product.name_ar,
                description_en: product.description_en || '',
                description_ar: product.description_ar || '',
                price: product.price,
                discount: product.discount || 0,
                stock: product.stock || 0,
                category_id: primaryCategoryId, // Keep legacy column updated for backwards compatibility
                image_url: product.image || '',
                slug: product.slug,
                skin_type: product.skin_type || 'normal',
                product_type: product.product_type || 'normal',
                highlight_en: product.highlight_en || '',
                highlight_ar: product.highlight_ar || '',
                faq_en: product.faq_en || {},
                faq_ar: product.faq_ar || {},
                gallery: product.gallery || [],
                is_visible: product.visible ?? true
            })
            .eq('id', product.product_id);

        if (productError) {
            console.error("[IAdminRepository] updateProduct error:", productError);
            throw productError;
        }


        // 1.5. Update product_categories junction table
        if (product.category_ids !== undefined) {
            // Delete existing category relationships first
            const { error: deleteError } = await supabaseAdmin.schema('store')
                .from('product_categories')
                .delete()
                .eq('product_id', product.product_id);

            if (deleteError) {
                console.error("[IAdminRepository] Error deleting categories:", deleteError);
            }

            // Insert new category relationships only if there are categories to add
            if (product.category_ids && product.category_ids.length > 0) {
                const categoryRecords = product.category_ids.map(categoryId => ({
                    product_id: product.product_id,
                    category_id: categoryId
                }));

                const { error: categoryError } = await supabaseAdmin.schema('store')
                    .from('product_categories')
                    .insert(categoryRecords)
                    .select();

                if (categoryError) {
                    console.error("[IAdminRepository] Error inserting categories:", categoryError);
                }
            }
        }

        // 2. Update main product materials
        if (product.materials && product.materials.length > 0) {
            // Track IDs for deletion
            const materialIds: number[] = [];

            for (const mat of product.materials) {
                console.log("[IAdminRepository] Updating material:", mat);

                if (mat.id && typeof mat.id === 'number' && mat.id > 0) {
                    // Update existing material link
                    const { error: matError } = await supabaseAdmin.schema('store')
                        .from('product_materials')
                        .update({
                            grams_used: mat.grams_used,
                            measurement_unit: mat.measurement_unit || 'gm'
                        })
                        .eq('id', mat.id);

                    if (matError) {
                        console.error("[IAdminRepository] Material update error:", matError);
                    } else {
                        console.log("[IAdminRepository] Material updated successfully, id:", mat.id);
                        materialIds.push(mat.id);
                    }
                } else {
                    // Upsert new material link (handles duplicate key)
                    const { data: newMat, error: insertError } = await supabaseAdmin.schema('store')
                        .from('product_materials')
                        .upsert({
                            product_id: product.product_id,
                            variant_id: null,
                            material_id: mat.material_id,
                            grams_used: mat.grams_used,
                            measurement_unit: mat.measurement_unit || 'gm'
                        }, { onConflict: 'product_id, variant_id, material_id' })
                        .select('id')
                        .single();

                    if (insertError) {
                        console.error("[IAdminRepository] Material insert error:", insertError);
                    } else {
                        console.log("[IAdminRepository] Material inserted successfully, id:", newMat?.id);
                        if (newMat?.id) materialIds.push(newMat.id);
                    }
                }
            }

            // Delete materials not in current list
            if (materialIds.length > 0) {
                await supabaseAdmin.schema('store')
                    .from('product_materials')
                    .delete()
                    .eq('product_id', product.product_id)
                    .is('variant_id', null)
                    .not('id', 'in', `(${materialIds.join(',')})`);
            }
        }

        // 3. Update variants
        const variantIds: number[] = [];
        for (const variant of (product.variants || [])) {
            if (variant.id) {
                // Update existing variant
                await supabaseAdmin.schema('store')
                    .from('product_variants')
                    .update({
                        name_en: variant.name_en,
                        name_ar: variant.name_ar,
                        price: variant.price,
                        stock: variant.stock,
                        discount: variant.discount || 0,
                        description_en: variant.description_en || '',
                        description_ar: variant.description_ar || '',
                        type_en: variant.type_en || '',
                        type_ar: variant.type_ar || '',
                        image: variant.image || '',
                        gallery: variant.gallery || [],
                        slug: variant.slug
                    })
                    .eq('id', variant.id);

                variantIds.push(variant.id);

                // Update variant materials
                console.log("[IAdminRepository] Variant", variant.id, "materials:", variant.materials);
                if (variant.materials && variant.materials.length > 0) {
                    const variantMaterialIds: number[] = [];

                    for (const mat of variant.materials) {
                        console.log("[IAdminRepository] Processing variant material:", mat);
                        if (mat.id && typeof mat.id === 'number' && mat.id > 0) {
                            // Update existing material link
                            const { error: matError } = await supabaseAdmin.schema('store')
                                .from('product_materials')
                                .update({
                                    grams_used: mat.grams_used,
                                    measurement_unit: mat.measurement_unit || 'gm'
                                })
                                .eq('id', mat.id);

                            if (!matError) {
                                variantMaterialIds.push(mat.id);
                            }
                        } else {
                            // Upsert new material link (handles duplicate key)
                            console.log("[IAdminRepository] Upserting variant material:", {
                                product_id: product.product_id,
                                variant_id: variant.id,
                                material_id: mat.material_id,
                                grams_used: mat.grams_used
                            });
                            const { data: newMat, error: insertError } = await supabaseAdmin.schema('store')
                                .from('product_materials')
                                .upsert({
                                    product_id: product.product_id,
                                    variant_id: variant.id,
                                    material_id: mat.material_id,
                                    grams_used: mat.grams_used,
                                    measurement_unit: mat.measurement_unit || 'gm'
                                }, { onConflict: 'product_id, variant_id, material_id' })
                                .select('id')
                                .single();

                            if (insertError) {
                                console.error("[IAdminRepository] Variant material insert ERROR:", insertError);
                            } else {
                                console.log("[IAdminRepository] Variant material inserted successfully, id:", newMat?.id);
                                if (newMat?.id) variantMaterialIds.push(newMat.id);
                            }
                        }
                    }

                    // Delete variant materials not in current list
                    if (variantMaterialIds.length > 0) {
                        await supabaseAdmin.schema('store')
                            .from('product_materials')
                            .delete()
                            .eq('product_id', product.product_id)
                            .eq('variant_id', variant.id)
                            .not('id', 'in', `(${variantMaterialIds.join(',')})`);
                    }
                }
            }
        }

        console.log("[IAdminRepository] updateProduct completed successfully");
        return product.product_id;
    }

    async deleteProduct(product: ProductAdminView): Promise<void> {
        console.log("[IAdminRepository] deleteProduct called with slug:", product.slug);
        const table = product.variant_id ? 'product_variants' : 'products';
        const {
            data,
            status,
            statusText,
            error
        } = await supabaseAdmin.schema('store').from(table).delete().eq('slug', product.slug);

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
            } = await supabaseAdmin.schema('store').from('products').delete().eq('id', product.product_id);
            console.log("[IAdminRepository] deleteProduct result:", { data, status, statusText });
            if (error) {
                console.error("[IAdminRepository] deleteProduct error:", error);
                throw error;
            }
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

    async updateCategory(category: Partial<Category>): Promise<void> {
        console.log("[IAdminRepository] updateCategory called with:", category);
        const { id, ...updateData } = category;
        if (!id) {
            throw new Error("Category ID is required for update");
        }
        const { error } = await supabaseAdmin.schema('store')
            .from('categories')
            .update(updateData)
            .eq('id', id);
        if (error) {
            console.error("[IAdminRepository] updateCategory error:", error);
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

        if (!data || data.length === 0) {
            return [];
        }

        // Fetch all product_categories in one query for efficiency
        const productIds = [...new Set(data.map((p: any) => p.product_id))];
        const { data: allProductCategories } = await supabaseAdmin.schema('store')
            .from('product_categories')
            .select('product_id, category_id, categories:category_id(id, name_en, name_ar)')
            .in('product_id', productIds);

        // Create a map of product_id to categories array
        const categoriesMap: Record<number, any[]> = {};
        for (const pc of (allProductCategories || [])) {
            if (!categoriesMap[pc.product_id]) {
                categoriesMap[pc.product_id] = [];
            }
            if (pc.categories) {
                categoriesMap[pc.product_id].push(pc.categories);
            }
        }

        // Attach categories to each product
        return data.map((product: any) => ({
            ...product,
            categories: categoriesMap[product.product_id] || [],
            category_ids: (categoriesMap[product.product_id] || []).map((c: any) => c.id)
        }));
    }

    async getProductForEdit(slug: string): Promise<ProductAdminView | null> {
        console.log("[IAdminRepository] getProductForEdit called with slug:", slug);

        // 1. Try to find in products table first
        let productId: number | null = null;
        let { data: product, error: productError } = await supabaseAdmin.schema('store')
            .from('products')
            .select('*, categories(id, name_en, name_ar)')
            .eq('slug', slug)
            .maybeSingle();

        if (product) {
            productId = product.id;
        } else {
            // 2. If not found in products, search in product_variants and get parent product
            console.log("[IAdminRepository] Not found in products, searching in variants...");
            const { data: variant, error: variantError } = await supabaseAdmin.schema('store')
                .from('product_variants')
                .select('product_id')
                .eq('slug', slug)
                .maybeSingle();

            if (variant) {
                productId = variant.product_id;
                // Now fetch the parent product
                const { data: parentProduct, error: parentError } = await supabaseAdmin.schema('store')
                    .from('products')
                    .select('*, categories(id, name_en, name_ar)')
                    .eq('id', productId)
                    .single();

                if (parentError) {
                    console.error("[IAdminRepository] getProductForEdit parent product error:", parentError);
                    return null;
                }
                product = parentProduct;
            } else {
                console.error("[IAdminRepository] getProductForEdit: Product not found in products or variants");
                return null;
            }
        }

        // 2. Get variants for this product
        const { data: variants, error: variantsError } = await supabaseAdmin.schema('store')
            .from('product_variants')
            .select('*')
            .eq('product_id', product.id);

        if (variantsError) {
            console.error("[IAdminRepository] getProductForEdit variants error:", variantsError);
        }

        // 3. Get materials for main product (variant_id IS NULL)
        // Note: product_materials is in store schema, materials is in admin schema
        // We can't use Supabase's foreign key join across schemas, so we fetch separately
        const { data: productMaterialLinks, error: productMaterialsError } = await supabaseAdmin.schema('store')
            .from('product_materials')
            .select('*')
            .eq('product_id', product.id)
            .is('variant_id', null);

        if (productMaterialsError) {
            console.error("[IAdminRepository] getProductForEdit product materials error:", productMaterialsError);
        }

        // Fetch all material details from admin schema
        const materialIds = (productMaterialLinks || []).map((pm: any) => pm.material_id).filter(Boolean);
        let materialsMap: Record<number, any> = {};

        if (materialIds.length > 0) {
            const { data: materialsData } = await supabaseAdmin.schema('admin')
                .from('materials')
                .select('id, name, material_type, price_per_gram')
                .in('id', materialIds);

            materialsMap = (materialsData || []).reduce((acc: Record<number, any>, mat: any) => {
                acc[mat.id] = mat;
                return acc;
            }, {});
        }

        // 4. Get materials for each variant
        const variantsWithMaterials = await Promise.all((variants || []).map(async (variant: any) => {
            const { data: variantMaterialLinks } = await supabaseAdmin.schema('store')
                .from('product_materials')
                .select('*')
                .eq('variant_id', variant.id);

            // Fetch variant material details
            const variantMaterialIds = (variantMaterialLinks || []).map((pm: any) => pm.material_id).filter(Boolean);
            let variantMaterialsMap: Record<number, any> = {};

            if (variantMaterialIds.length > 0) {
                const { data: variantMaterialsData } = await supabaseAdmin.schema('admin')
                    .from('materials')
                    .select('id, name, material_type, price_per_gram')
                    .in('id', variantMaterialIds);

                variantMaterialsMap = (variantMaterialsData || []).reduce((acc: Record<number, any>, mat: any) => {
                    acc[mat.id] = mat;
                    return acc;
                }, {});
            }

            return {
                ...variant,
                materials: (variantMaterialLinks || []).map((pm: any) => ({
                    id: pm.id,
                    material_id: pm.material_id,
                    grams_used: pm.grams_used,
                    measurement_unit: pm.measurement_unit,
                    material_name: variantMaterialsMap[pm.material_id]?.name,
                    material_type: variantMaterialsMap[pm.material_id]?.material_type,
                    price: variantMaterialsMap[pm.material_id]?.price_per_gram
                }))
            };
        }));

        // 5. Fetch product categories from junction table
        const { data: productCategoriesData } = await supabaseAdmin.schema('store')
            .from('product_categories')
            .select('category_id')
            .eq('product_id', product.id);

        const categoryIds = (productCategoriesData || []).map((pc: any) => pc.category_id);

        // 6. Format the result to match ProductAdminView
        const result: ProductAdminView = {
            product_id: product.id,
            variant_id: null,
            name_en: product.name_en || '',
            name_ar: product.name_ar || '',
            description_en: product.description_en || '',
            description_ar: product.description_ar || '',
            price: product.price || 0,
            discount: product.discount || 0,
            image: product.image_url || '',
            category_ids: categoryIds,
            skin_type: product.skin_type || 'normal',
            slug: product.slug,
            stock: product.stock || 0,
            product_type: product.product_type || 'normal',
            highlight_en: product.highlight_en || '',
            highlight_ar: product.highlight_ar || '',
            faq_en: product.faq_en || {},
            faq_ar: product.faq_ar || {},
            gallery: product.gallery || [],
            variants: variantsWithMaterials.map((v: any) => ({
                id: v.id,
                product_id: product.id,
                name_en: v.name_en || '',
                name_ar: v.name_ar || '',
                price: v.price || 0,
                stock: v.stock || 0,
                discount: v.discount || 0,
                description_en: v.description_en || '',
                description_ar: v.description_ar || '',
                type_en: v.type_en || '',
                type_ar: v.type_ar || '',
                image: v.image || '',
                gallery: v.gallery || [],
                slug: v.slug || '',
                materials: v.materials || []
            })),
            materials: (productMaterialLinks || []).map((pm: any) => ({
                id: pm.id,
                material_id: pm.material_id,
                grams_used: pm.grams_used,
                measurement_unit: pm.measurement_unit,
                material_name: materialsMap[pm.material_id]?.name,
                material_type: materialsMap[pm.material_id]?.material_type,
                price: materialsMap[pm.material_id]?.price_per_gram
            })),
            visible: product.is_visible ?? true
        };

        console.log("[IAdminRepository] getProductForEdit result:", result);
        return result;
    }

    async uploadImage(file: File): Promise<string> {
        console.log("[IProductRepository] uploadImage called with file:", file.name)
        const fileExt = file.name.split(".").pop();
        const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { data, error } = await supabaseAdmin.storage
            .from("nature-hug")
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
            .from("nature-hug")
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

        // 1. Fetch existing order to get FKs
        const { data: existingOrder, error: fetchError } = await supabaseAdmin.schema('store')
            .from('orders')
            .select('customer_id, shipping_address_id')
            .eq('id', order.order_id)
            .single();

        if (fetchError || !existingOrder) {
            console.error("[IAdminRepository] updateOrder failed to fetch existing order:", fetchError);
            throw fetchError || new Error("Order not found");
        }

        // 2. Update Customer Details (if provided)
        if (existingOrder.customer_id && (order.customer_name !== undefined || order.customer_email !== undefined)) {
            const customerUpdate: any = {};
            if (order.customer_name !== undefined) customerUpdate.name = order.customer_name;
            // Only update email if it's not empty to avoid duplicate key error
            if (order.customer_email !== undefined && order.customer_email.trim() !== '') {
                customerUpdate.email = order.customer_email;
            }

            if (Object.keys(customerUpdate).length > 0) {
                const { error: customerError } = await supabaseAdmin.schema('store')
                    .from('customers')
                    .update(customerUpdate)
                    .eq('id', existingOrder.customer_id);

                if (customerError) {
                    console.error("[IAdminRepository] updateOrder customer update error:", customerError);
                    // Decide if this should be fatal. Typically yes for data integrity.
                    throw customerError;
                }
            }
        }

        // 3. Update Shipping Address (if provided)
        if (existingOrder.shipping_address_id && order.shipping_street_address !== undefined) {
            const { error: addressError } = await supabaseAdmin.schema('store')
                .from('customer_addresses')
                .update({ address: order.shipping_street_address })
                .eq('id', existingOrder.shipping_address_id);

            if (addressError) {
                console.error("[IAdminRepository] updateOrder address update error:", addressError);
                throw addressError;
            }
        }

        // 4. Update Order Table (Status, Totals, Payments ONLY)
        const updateData: any = {};

        // Status updates
        if (order.order_status !== undefined) updateData.status = order.order_status;
        if (order.shipment_id) updateData.shipment_id = order.shipment_id;
        if (order.awb) updateData.awb = order.awb;

        // NOTE: guest_name, guest_email, guest_address REMOVED because columns don't exist.
        // We updated the linked customer/address records above instead.

        // Price updates (map view fields to actual table columns)
        if (order.subtotal !== undefined) updateData.subtotal = order.subtotal;
        if (order.shipping_total !== undefined) updateData.shipping_total = order.shipping_total;
        if (order.discount_total !== undefined) updateData.discount_total = order.discount_total;
        if (order.final_order_total !== undefined) updateData.grand_total = order.final_order_total;

        // Payment info
        if (order.payment_method !== undefined) updateData.payment_method = order.payment_method;
        if (order.payment_status !== undefined) updateData.payment_status = order.payment_status;

        // Order notes
        if ((order as any).note !== undefined) updateData.note = (order as any).note;

        if (Object.keys(updateData).length > 0) {
            console.log("[IAdminRepository] updateOrder - Final updateData before call:", JSON.stringify(updateData, null, 2));
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

            // Deduct packaging materials when order is set to processing
            if (order.order_status === 'processing' && order.order_id) {
                try {
                    const { deductPackagingForOrder } = await import("@/lib/services/stockService");
                    await deductPackagingForOrder(order.order_id);
                } catch (packagingError) {
                    console.error("[IAdminRepository] Packaging deduction error (non-fatal):", packagingError);
                }
            }
        }

        // Update phone numbers if provided
        if (order.phone_numbers && order.phone_numbers.length > 0) {
            // Delete existing phone numbers
            await supabaseAdmin.schema('store').from('order_phone_numbers').delete().eq('order_id', order.order_id);

            // Insert new phone numbers
            const phoneRecords = order.phone_numbers.map(phone => ({
                order_id: order.order_id,
                phone_number: phone
            }));
            const { error: phoneError } = await supabaseAdmin.schema('store')
                .from('order_phone_numbers')
                .insert(phoneRecords);

            if (phoneError) {
                console.error("[IAdminRepository] updateOrder phone numbers error:", phoneError);
            }
        }

        // Update order items if provided
        if ((order as any).items && Array.isArray((order as any).items)) {
            const items = (order as any).items as Array<{
                id?: number;
                quantity: number;
                unit_price: number;
                product_id?: number | null;
                variant_id?: number | null;
                isNew?: boolean;
            }>;

            for (const item of items) {
                if (item.isNew && item.product_id) {
                    // INSERT new item
                    console.log("[IAdminRepository] Inserting new order item:", item);

                    // First, get the product name for item_name
                    let itemName = "Product";
                    const { data: productData } = await supabaseAdmin.schema('store')
                        .from('products')
                        .select('name_en')
                        .eq('id', item.product_id)
                        .single();

                    if (productData) {
                        itemName = productData.name_en;
                    }

                    // If there's a variant, get its name too
                    if (item.variant_id) {
                        const { data: variantData } = await supabaseAdmin.schema('store')
                            .from('product_variants')
                            .select('name_en')
                            .eq('id', item.variant_id)
                            .single();

                        if (variantData) {
                            itemName = `${itemName} - ${variantData.name_en}`;
                        }
                    }

                    const { error: insertError } = await supabaseAdmin.schema('store')
                        .from('order_items')
                        .insert({
                            order_id: order.order_id,
                            product_id: item.product_id,
                            variant_id: item.variant_id || null,
                            quantity: item.quantity,
                            unit_price: item.unit_price,
                            discount: 0
                        });

                    if (insertError) {
                        console.error("[IAdminRepository] updateOrder item insert error:", insertError);
                        throw insertError;
                    }
                    console.log("[IAdminRepository] New order item inserted successfully");
                } else if (item.id) {
                    // UPDATE existing item
                    console.log("[IAdminRepository] Updating order item:", item.id, "quantity:", item.quantity, "price:", item.unit_price);

                    const { error: itemError } = await supabaseAdmin.schema('store')
                        .from('order_items')
                        .update({
                            quantity: item.quantity,
                            unit_price: item.unit_price
                        })
                        .eq('id', item.id);

                    if (itemError) {
                        console.error("[IAdminRepository] updateOrder item update error:", itemError);
                        throw itemError;
                    }
                    console.log("[IAdminRepository] Order item", item.id, "updated successfully");
                }
            }
        }

        // Delete removed items if provided
        const removedItemIds = (order as any).removed_item_ids as number[] | undefined;
        if (removedItemIds && removedItemIds.length > 0) {
            console.log("[IAdminRepository] Deleting removed order items:", removedItemIds);

            const { error: deleteError } = await supabaseAdmin.schema('store')
                .from('order_items')
                .delete()
                .in('id', removedItemIds);

            if (deleteError) {
                console.error("[IAdminRepository] updateOrder item delete error:", deleteError);
                throw deleteError;
            }
            console.log("[IAdminRepository] Removed order items deleted successfully");
        }

        console.log("[IAdminRepository] Order update completed successfully");
    }

    async deleteOrder(orderId: number): Promise<void> {
        console.log("[IAdminRepository] deleteOrder called with orderId:", orderId);

        // Restore stock before deleting order
        const { restoreOrderStock, restorePackagingForOrder } = await import("@/lib/services/stockService");
        await restoreOrderStock(orderId);
        await restorePackagingForOrder(orderId);

        // First delete order items
        const { error: itemsError } = await supabaseAdmin.schema('store')
            .from('order_items')
            .delete()
            .eq('order_id', orderId);

        if (itemsError) {
            console.error("[IAdminRepository] deleteOrder items error:", itemsError);
            throw itemsError;
        }

        // Delete phone numbers
        const { error: phonesError } = await supabaseAdmin.schema('store')
            .from('order_phone_numbers')
            .delete()
            .eq('order_id', orderId);

        if (phonesError) {
            console.error("[IAdminRepository] deleteOrder phones error:", phonesError);
            // Don't throw, table might not exist or have FK constraint
        }

        // Finally delete the order
        const { error } = await supabaseAdmin.schema('store')
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) {
            console.error("[IAdminRepository] deleteOrder error:", error);
            throw error;
        }

        console.log("[IAdminRepository] deleteOrder completed successfully");
    }
    async getAllImages(): Promise<{ image: any, url: string }[]> {
        console.log("[IAdminRepository] getAllImages called.");

        const { data, error } = await supabaseAdmin.storage.from('nature-hug').list('products', { sortBy: { column: 'created_at', order: 'desc' } });

        console.log("[IAdminRepository] getAllImages result:", { data });
        if (error) {
            console.error("[IAdminRepository] getAllImages error:", error);
            throw error;
        }

        const images: { image: any, url: string }[] = [];
        if (data && Array.isArray(data)) {
            for (const item of data) {
                const { data: urlData } = supabaseAdmin.storage.from('nature-hug').getPublicUrl('products/' + item.name);
                if (urlData?.publicUrl) {
                    images.push({ image: item, url: urlData.publicUrl });
                }
            }
        }

        return images;
    }
    async deleteImage(imageName: string): Promise<void> {
        console.log("[IAdminRepository] deleteImage called with imageName:", imageName);

        const { data, error } = await supabaseAdmin.storage.from('nature-hug').remove(['products/' + imageName]);

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
        console.log(`[IAdminRepository] addProductStock called for productId: ${product.product_id}, variantId: ${product.variant_id}, quantity: ${quantity}`);

        // 1. Fetch materials from database (don't rely on product.materials which may be empty)
        // Note: .is() only works with null/true/false, use .eq() for numeric values
        let query = supabaseAdmin.schema('store')
            .from('product_materials')
            .select('material_id, grams_used, measurement_unit')
            .eq('product_id', product.product_id);

        // Apply variant filter correctly
        if (product.variant_id !== null && product.variant_id !== undefined) {
            query = query.eq('variant_id', product.variant_id);
        } else {
            query = query.is('variant_id', null);
        }

        const { data: productMaterialLinks, error: pmError } = await query;

        if (pmError) {
            console.error("[IAdminRepository] addProductStock fetch materials error:", pmError);
            throw pmError;
        }

        console.log("[IAdminRepository] Product materials fetched:", productMaterialLinks);

        // 2. Calculate materials needed
        const materialsNeeded = (productMaterialLinks || [])
            .filter((pm: any) => pm.material_id && pm.grams_used)
            .map((pm: any) => ({
                material_id: pm.material_id,
                amount: (pm.grams_used || 0) * quantity
            }));

        console.log("[IAdminRepository] Materials needed:", materialsNeeded);

        if (materialsNeeded.length === 0) {
            // No materials linked to this product, just update stock
            console.log("[IAdminRepository] No materials linked, updating stock directly.");
        } else {
            // 3. Check Material Availability
            const materialIds = materialsNeeded.map(m => m.material_id);
            const { data: currentMaterials, error: matError } = await supabaseAdmin.schema('admin')
                .from("materials")
                .select('id, stock_grams, name')
                .in('id', materialIds);

            if (matError) throw matError;

            // Check if all materials have sufficient stock
            const insufficientMaterials: string[] = [];
            for (const need of materialsNeeded) {
                const mat = currentMaterials?.find(m => m.id === need.material_id);
                if (!mat) {
                    throw new Error(`Material ID ${need.material_id} not found`);
                }
                if ((mat.stock_grams || 0) < need.amount) {
                    insufficientMaterials.push(`${mat.name}: Required ${need.amount}g, Available ${mat.stock_grams || 0}g`);
                }
            }

            // If any material is insufficient, throw error and don't proceed
            if (insufficientMaterials.length > 0) {
                throw new Error(`Insufficient material stock:\n${insufficientMaterials.join('\n')}`);
            }

            console.log("[IAdminRepository] Material availability checked successfully.");

            // 4. Deduct Materials
            console.log("[IAdminRepository] Deducting materials...");
            for (const need of materialsNeeded) {
                const mat = currentMaterials?.find(m => m.id === need.material_id)!;
                const newStock = (mat.stock_grams || 0) - need.amount;
                console.log(`[IAdminRepository] Deducting ${need.amount}g from ${mat.name}, new stock: ${newStock}g`);

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

    async getAllGovernorates(): Promise<Governorate[]> {
        console.log("[IAdminRepository] getAllGovernorates called.");
        const { data, error } = await supabaseAdmin.schema('store')
            .from('shipping_governorates')
            .select('*')
            .order('name_en', { ascending: true });

        if (error) {
            console.error("[IAdminRepository] getAllGovernorates error:", error);
            throw error;
        }
        return data || [];
    }

    async updateGovernorateFees(slug: string, fees: number): Promise<void> {
        console.log(`[IAdminRepository] updateGovernorateFees called for slug: ${slug}, fees: ${fees}`);
        const { error } = await supabaseAdmin.schema('store')
            .from('shipping_governorates')
            .update({ fees })
            .eq('slug', slug);

        if (error) {
            console.error("[IAdminRepository] updateGovernorateFees error:", error);
            throw error;
        }
    }

    async toggleProductVisibility(id: number, isVariant: boolean, visible: boolean): Promise<void> {
        console.log(`[IAdminRepository] toggleProductVisibility called for id: ${id}, isVariant: ${isVariant}, is_visible: ${visible}`);
        const table = isVariant ? 'product_variants' : 'products';
        const { error } = await supabaseAdmin.schema('store')
            .from(table)
            .update({ is_visible: visible })
            .eq('id', id);

        if (error) {
            console.error(`[IAdminRepository] toggleProductVisibility error (table: ${table}):`, error);
            throw error;
        }
    }

    // ============================================
    // REPORTS METHODS
    // ============================================

    async getAccountsReport(startDate: string, endDate: string): Promise<AccountReportView[]> {
        console.log(`[IAdminRepository] getAccountsReport called for period: ${startDate} to ${endDate}`);

        const { data, error } = await supabaseAdmin.schema('admin')
            .rpc("get_accounts_performance_report", {
                start_date: startDate,
                end_date: endDate
            });

        if (error) {
            console.error("[IAdminRepository] getAccountsReport error:", error);
            throw error;
        }
        return data || [];
    }

    async getProductSalesReport(startDate: string, endDate: string): Promise<ProductSalesReport[]> {
        console.log(`[IAdminRepository] getProductSalesReport called for period: ${startDate} to ${endDate}`);

        const { data, error } = await supabaseAdmin.schema('admin')
            .rpc("get_product_sales_report", {
                start_date: startDate,
                end_date: endDate
            });

        if (error) {
            console.error("[IAdminRepository] getProductSalesReport error:", error);
            throw error;
        }
        return data || [];
    }

    async getReportSummary(startDate: string, endDate: string): Promise<ReportSummary> {
        console.log(`[IAdminRepository] getReportSummary called for period: ${startDate} to ${endDate}`);

        const { data, error } = await supabaseAdmin.schema('admin')
            .rpc("get_report_summary", {
                start_date: startDate,
                end_date: endDate
            });

        if (error) {
            console.error("[IAdminRepository] getReportSummary error:", error);
            throw error;
        }
        return data || {
            total_orders: 0,
            total_revenue: 0,
            average_order_value: 0,
            period_start: new Date(startDate),
            period_end: new Date(endDate)
        };
    }

    async getInventoryData(): Promise<{ product_id: number; variant_id: number | null; name: string; variant_name: string | null; stock: number; price: number; }[]> {
        console.log("[IAdminRepository] getInventoryData called.");

        const items: { product_id: number; variant_id: number | null; name: string; variant_name: string | null; stock: number; price: number; }[] = [];

        // Get all products
        const { data: products, error: productsError } = await supabaseAdmin.schema('store')
            .from('products')
            .select('id, name_en, stock, price');

        if (productsError) {
            console.error("[IAdminRepository] getInventoryData products error:", productsError);
            throw productsError;
        }

        // Get all variants
        const { data: variants, error: variantsError } = await supabaseAdmin.schema('store')
            .from('product_variants')
            .select('id, product_id, name_en, stock, price');

        if (variantsError) {
            console.error("[IAdminRepository] getInventoryData variants error:", variantsError);
            throw variantsError;
        }

        // Create a set of product IDs that have variants
        const productIdsWithVariants = new Set((variants || []).map((v: any) => v.product_id));

        // Add products without variants
        for (const product of (products || [])) {
            if (!productIdsWithVariants.has(product.id)) {
                items.push({
                    product_id: product.id,
                    variant_id: null,
                    name: product.name_en,
                    variant_name: null,
                    stock: product.stock || 0,
                    price: product.price || 0
                });
            }
        }

        // Create a map of product names
        const productNameMap = new Map((products || []).map((p: any) => [p.id, p.name_en]));

        // Add variants
        for (const variant of (variants || [])) {
            items.push({
                product_id: variant.product_id,
                variant_id: variant.id,
                name: productNameMap.get(variant.product_id) || 'Unknown',
                variant_name: variant.name_en,
                stock: variant.stock || 0,
                price: variant.price || 0
            });
        }

        console.log("[IAdminRepository] getInventoryData result:", items.length, "items");
        return items;
    }
}
