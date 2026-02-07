import { createSupabaseServiceClient } from "@/data/datasources/supabase/server";

/**
 * StockService - Handles stock management for orders
 * Used to restore stock when orders are cancelled or deleted
 */

interface OrderItem {
    product_id: number | null;
    variant_id: number | null;
    quantity: number;
}

/**
 * Restores stock for all items in an order.
 * This should be called BEFORE the order is deleted or its status is changed to cancelled.
 * 
 * @param orderId - The ID of the order to restore stock for
 */
export async function restoreOrderStock(orderId: number): Promise<void> {
    console.log(`[StockService] restoreOrderStock called for orderId: ${orderId}`);

    const supabase = await createSupabaseServiceClient();

    // 1. Fetch order items
    const { data: orderItems, error: itemsError } = await supabase.schema('store')
        .from('order_items')
        .select('product_id, variant_id, quantity')
        .eq('order_id', orderId);

    if (itemsError) {
        console.error("[StockService] Failed to fetch order items:", itemsError);
        throw itemsError;
    }

    if (!orderItems || orderItems.length === 0) {
        console.log("[StockService] No items found for order, nothing to restore");
        return;
    }

    console.log(`[StockService] Found ${orderItems.length} items to restore`);

    // 2. Restore stock for each item
    for (const item of orderItems as OrderItem[]) {
        await restoreItemStock(supabase, item);
    }

    console.log(`[StockService] Stock restoration completed for order ${orderId}`);
}

/**
 * Restores stock for a single order item (product or variant)
 */
async function restoreItemStock(supabase: any, item: OrderItem): Promise<void> {
    const { product_id, variant_id, quantity } = item;

    if (variant_id) {
        // Restore variant stock
        console.log(`[StockService] Restoring ${quantity} units to variant ${variant_id}`);

        // Get current stock
        const { data: variant, error: fetchError } = await supabase.schema('store')
            .from('product_variants')
            .select('stock')
            .eq('id', variant_id)
            .single();

        if (fetchError) {
            console.error(`[StockService] Failed to fetch variant ${variant_id}:`, fetchError);
            return; // Continue with other items
        }

        const newStock = (variant?.stock || 0) + quantity;

        const { error: updateError } = await supabase.schema('store')
            .from('product_variants')
            .update({ stock: newStock })
            .eq('id', variant_id);

        if (updateError) {
            console.error(`[StockService] Failed to update variant ${variant_id} stock:`, updateError);
        } else {
            console.log(`[StockService] Variant ${variant_id} stock restored to ${newStock}`);
        }

        // Restore materials for variant
        await restoreMaterials(supabase, null, variant_id, quantity);

    } else if (product_id) {
        // Restore product stock
        console.log(`[StockService] Restoring ${quantity} units to product ${product_id}`);

        // Get current stock
        const { data: product, error: fetchError } = await supabase.schema('store')
            .from('products')
            .select('stock')
            .eq('id', product_id)
            .single();

        if (fetchError) {
            console.error(`[StockService] Failed to fetch product ${product_id}:`, fetchError);
            return;
        }

        const newStock = (product?.stock || 0) + quantity;

        const { error: updateError } = await supabase.schema('store')
            .from('products')
            .update({ stock: newStock })
            .eq('id', product_id);

        if (updateError) {
            console.error(`[StockService] Failed to update product ${product_id} stock:`, updateError);
        } else {
            console.log(`[StockService] Product ${product_id} stock restored to ${newStock}`);
        }

        // Restore materials for product
        await restoreMaterials(supabase, product_id, null, quantity);
    }
}

/**
 * Restores materials used for a product/variant
 */
async function restoreMaterials(
    supabase: any,
    productId: number | null,
    variantId: number | null,
    quantity: number
): Promise<void> {
    // Build query based on product or variant
    let query = supabase.schema('store')
        .from('product_materials')
        .select('material_id, grams_used');

    if (variantId) {
        query = query.eq('variant_id', variantId);
    } else if (productId) {
        query = query.eq('product_id', productId).is('variant_id', null);
    } else {
        return;
    }

    const { data: materials, error: matError } = await query;

    if (matError || !materials || materials.length === 0) {
        // No materials linked, that's fine
        return;
    }

    console.log(`[StockService] Restoring ${materials.length} material(s) for ${variantId ? 'variant' : 'product'} ${variantId || productId}`);

    for (const mat of materials) {
        if (!mat.material_id || !mat.grams_used) continue;

        const gramsToRestore = mat.grams_used * quantity;

        // Get current material stock
        const { data: currentMat, error: fetchError } = await supabase.schema('admin')
            .from('materials')
            .select('stock_grams')
            .eq('id', mat.material_id)
            .single();

        if (fetchError) {
            console.error(`[StockService] Failed to fetch material ${mat.material_id}:`, fetchError);
            continue;
        }

        const newStock = (currentMat?.stock_grams || 0) + gramsToRestore;

        const { error: updateError } = await supabase.schema('admin')
            .from('materials')
            .update({ stock_grams: newStock })
            .eq('id', mat.material_id);

        if (updateError) {
            console.error(`[StockService] Failed to restore material ${mat.material_id}:`, updateError);
        } else {
            console.log(`[StockService] Material ${mat.material_id} restored ${gramsToRestore}g, new stock: ${newStock}g`);
        }
    }
}
