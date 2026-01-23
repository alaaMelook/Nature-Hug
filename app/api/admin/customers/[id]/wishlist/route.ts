import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { NextResponse } from "next/server";

// GET: Get customer's wishlist (for admin view)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const customerId = parseInt(id);

        if (isNaN(customerId)) {
            return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 });
        }

        // Get wishlist items with product and variant details
        const { data: wishlistItems, error } = await supabaseAdmin
            .schema('store')
            .from('wishlists')
            .select(`
                id,
                product_id,
                variant_id,
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
                )
            `)
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[Admin Wishlist GET] Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Enrich with display info
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

        return NextResponse.json({ items: enrichedItems });
    } catch (err: any) {
        console.error('[Admin Wishlist GET] Exception:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
