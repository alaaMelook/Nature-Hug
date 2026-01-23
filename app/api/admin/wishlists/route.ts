import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { NextResponse } from "next/server";

// GET: Get wishlist statistics and all wishlist items for admin
export async function GET() {
    try {
        // Get all wishlist items with product, variant, and customer details
        const { data: wishlistItems, error } = await supabaseAdmin
            .schema('store')
            .from('wishlists')
            .select(`
                id,
                product_id,
                variant_id,
                customer_id,
                created_at,
                product:products!inner(
                    slug,
                    name_en,
                    name_ar,
                    price,
                    image_url
                ),
                variant:product_variants(
                    id,
                    name_en,
                    name_ar,
                    price,
                    image
                ),
                customer:customers!inner(
                    id,
                    name,
                    phone,
                    email
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[Admin Wishlist] Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Calculate statistics
        const uniqueCustomers = new Set(wishlistItems?.map(item => item.customer_id) || []);
        const uniqueProducts = new Set(wishlistItems?.map(item => item.product_id) || []);

        // Group by product+variant to see popular items (variants separately)
        const variantCounts: Record<string, { count: number; product: any; variant: any; product_id: number; variant_id: number | null }> = {};
        (wishlistItems || []).forEach(item => {
            // Create unique key for product+variant combination
            const key = `${item.product_id}_${item.variant_id || 0}`;
            const variant = Array.isArray(item.variant) ? item.variant[0] : item.variant;
            if (!variantCounts[key]) {
                variantCounts[key] = {
                    count: 0,
                    product: item.product,
                    variant: variant,
                    product_id: item.product_id,
                    variant_id: item.variant_id
                };
            }
            variantCounts[key].count++;
        });

        const popularProducts = Object.values(variantCounts)
            .map(data => ({
                ...data,
                display_name: data.variant
                    ? `${(data.product as any)?.name_en} - ${data.variant.name_en}`
                    : (data.product as any)?.name_en,
                display_image: data.variant?.image || (data.product as any)?.image_url
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Enrich items with display info
        const enrichedItems = (wishlistItems || []).map(item => {
            // variant comes as array from Supabase join, get first element
            const variant = Array.isArray(item.variant) ? item.variant[0] : item.variant;
            return {
                ...item,
                variant,
                display_name_en: variant ? `${(item.product as any)?.name_en} - ${variant.name_en}` : (item.product as any)?.name_en,
                display_name_ar: variant ? `${(item.product as any)?.name_ar} - ${variant.name_ar}` : (item.product as any)?.name_ar,
                display_price: variant?.price || (item.product as any)?.price,
                display_image: variant?.image || (item.product as any)?.image_url
            };
        });

        return NextResponse.json({
            stats: {
                total_items: wishlistItems?.length || 0,
                unique_customers: uniqueCustomers.size,
                unique_products: uniqueProducts.size
            },
            popular_products: popularProducts,
            items: enrichedItems
        });
    } catch (err: any) {
        console.error('[Admin Wishlist] Exception:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
