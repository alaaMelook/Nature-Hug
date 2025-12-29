'use server'

import { AddStock } from "@/domain/use-case/admin/inventory/addStock";
import { revalidatePath } from "next/cache";
import { Material } from "@/domain/entities/database/material";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { supabaseAdmin } from "@/data/datasources/supabase/admin";

// Interface for material preview data
export interface MaterialPreviewItem {
    material_id: number;
    material_name: string;
    grams_per_unit: number;
    available_stock: number;
    measurement_unit: string;
}

export interface MaterialPreviewData {
    materials: MaterialPreviewItem[];
    maxProducibleUnits: number;
}

// Fetch material preview data for a product
export async function getProductMaterialsPreview(productId: number, variantId: number | null): Promise<MaterialPreviewData> {
    console.log(`[getProductMaterialsPreview] Called for productId: ${productId}, variantId: ${variantId}`);

    // 1. Fetch product materials
    // Note: .is() only works with null/true/false, use .eq() for numeric values
    let query = supabaseAdmin.schema('store')
        .from('product_materials')
        .select('material_id, grams_used, measurement_unit')
        .eq('product_id', productId);

    // Apply variant filter correctly
    if (variantId !== null && variantId !== undefined) {
        query = query.eq('variant_id', variantId);
    } else {
        query = query.is('variant_id', null);
    }

    const { data: productMaterialLinks, error: pmError } = await query;

    if (pmError) {
        console.error("[getProductMaterialsPreview] Error fetching product materials:", pmError);
        throw pmError;
    }

    if (!productMaterialLinks || productMaterialLinks.length === 0) {
        return { materials: [], maxProducibleUnits: Infinity };
    }

    // 2. Get material IDs and fetch their current stock
    const materialIds = productMaterialLinks.map((pm: any) => pm.material_id).filter(Boolean);

    const { data: materialsData, error: matError } = await supabaseAdmin.schema('admin')
        .from('materials')
        .select('id, name, stock_grams')
        .in('id', materialIds);

    if (matError) {
        console.error("[getProductMaterialsPreview] Error fetching materials:", matError);
        throw matError;
    }

    // 3. Build preview data and calculate max producible units
    const materialsMap = (materialsData || []).reduce((acc: Record<number, any>, m: any) => {
        acc[m.id] = m;
        return acc;
    }, {});

    let maxProducibleUnits = Infinity;
    const materials: MaterialPreviewItem[] = [];

    for (const pm of productMaterialLinks) {
        const mat = materialsMap[pm.material_id];
        if (!mat) continue;

        const gramsPerUnit = pm.grams_used || 0;
        const availableStock = mat.stock_grams || 0;

        materials.push({
            material_id: pm.material_id,
            material_name: mat.name,
            grams_per_unit: gramsPerUnit,
            available_stock: availableStock,
            measurement_unit: pm.measurement_unit || 'g'
        });

        // Calculate how many units can be made with this material
        if (gramsPerUnit > 0) {
            const unitsFromThisMaterial = Math.floor(availableStock / gramsPerUnit);
            maxProducibleUnits = Math.min(maxProducibleUnits, unitsFromThisMaterial);
        }
    }

    // If no materials have grams_per_unit, set to 0
    if (maxProducibleUnits === Infinity && materials.length > 0) {
        maxProducibleUnits = 0;
    }

    console.log(`[getProductMaterialsPreview] Result: ${materials.length} materials, max units: ${maxProducibleUnits}`);
    return { materials, maxProducibleUnits };
}

export async function addStockAction(type: 'material' | 'product', product: Material | ProductAdminView, quantity: number,) {
    try {
        await new AddStock().execute(type, product, quantity);
        revalidatePath('/admin/materials');
        revalidatePath('/admin/products');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to add stock:", error);
        return { success: false, error: error.message || "Failed to add stock" };
    }
}
