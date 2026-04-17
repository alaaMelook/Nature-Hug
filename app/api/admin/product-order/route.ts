import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/data/datasources/supabase/admin";

// GET: Fetch all products with variants and sort_order
export async function GET() {
    try {
        const { data: products, error } = await supabaseAdmin.schema('store')
            .from('products')
            .select('id, name, name_ar, slug, image_url, price, stock, is_visible, sort_order')
            .order('sort_order', { ascending: true });

        if (error) {
            console.error("[product-order] GET products error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get all variants with their sort_order
        const productIds = (products || []).map(p => p.id);
        const { data: variants, error: varError } = await supabaseAdmin.schema('store')
            .from('product_variants')
            .select('id, product_id, name_en, name_ar, slug, image, price, stock, is_visible, sort_order')
            .in('product_id', productIds)
            .order('sort_order', { ascending: true });

        if (varError) {
            console.error("[product-order] GET variants error:", varError);
        }

        // Group variants by product_id
        const variantMap: Record<number, any[]> = {};
        (variants || []).forEach(v => {
            if (!variantMap[v.product_id]) variantMap[v.product_id] = [];
            variantMap[v.product_id].push(v);
        });

        const enriched = (products || []).map(p => ({
            ...p,
            variants: variantMap[p.id] || [],
            variant_count: (variantMap[p.id] || []).length
        }));

        return NextResponse.json(enriched);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PATCH: Update product and variant sort_order in bulk
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { productOrder, variantOrder } = body;

        // Update product sort_order
        if (productOrder && Array.isArray(productOrder)) {
            const updates = productOrder.map(async (item: { id: number; sort_order: number }) => {
                const { error } = await supabaseAdmin.schema('store')
                    .from('products')
                    .update({ sort_order: item.sort_order })
                    .eq('id', item.id);
                if (error) {
                    console.error(`[product-order] Failed to update product ${item.id}:`, error);
                    throw error;
                }
            });
            await Promise.all(updates);
        }

        // Update variant sort_order
        if (variantOrder && Array.isArray(variantOrder)) {
            const updates = variantOrder.map(async (item: { id: number; sort_order: number }) => {
                const { error } = await supabaseAdmin.schema('store')
                    .from('product_variants')
                    .update({ sort_order: item.sort_order })
                    .eq('id', item.id);
                if (error) {
                    console.error(`[product-order] Failed to update variant ${item.id}:`, error);
                    throw error;
                }
            });
            await Promise.all(updates);
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
