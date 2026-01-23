import { createSupabaseServerClient } from "@/data/datasources/supabase/server";
import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { NextResponse } from "next/server";

// GET: Get user's wishlist
export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get customer id
        const { data: customer } = await supabaseAdmin
            .schema('store')
            .from('customers')
            .select('id')
            .eq('auth_user_id', user.id)
            .single();

        if (!customer) {
            return NextResponse.json({ items: [] });
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
                    image_url,
                    product_type
                ),
                variant:product_variants(
                    id,
                    name_en,
                    name_ar,
                    price,
                    image,
                    stock,
                    slug
                )
            `)
            .eq('customer_id', customer.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[Wishlist GET] Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Transform items to include variant info
        const enrichedItems = wishlistItems?.map(item => {
            // variant comes as array from Supabase join, get first element
            const variant = Array.isArray(item.variant) ? item.variant[0] : item.variant;
            return {
                ...item,
                variant,
                // Use variant price/image/slug if available, otherwise use product
                display_price: variant?.price || (item.product as any)?.price,
                display_image: variant?.image || (item.product as any)?.image_url,
                display_name_en: variant ? `${(item.product as any)?.name_en} - ${variant.name_en}` : (item.product as any)?.name_en,
                display_name_ar: variant ? `${(item.product as any)?.name_ar} - ${variant.name_ar}` : (item.product as any)?.name_ar,
                display_slug: variant?.slug || (item.product as any)?.slug,
                stock: variant?.stock || 999
            };
        }) || [];

        return NextResponse.json({ items: enrichedItems });
    } catch (err: any) {
        console.error('[Wishlist GET] Exception:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: Add product/variant to wishlist
export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { product_id, variant_id } = await request.json();

        if (!product_id) {
            return NextResponse.json({ error: "product_id is required" }, { status: 400 });
        }

        // Get or create customer
        let { data: customer } = await supabaseAdmin
            .schema('store')
            .from('customers')
            .select('id')
            .eq('auth_user_id', user.id)
            .single();

        if (!customer) {
            // Create customer record
            const { data: newCustomer, error: createError } = await supabaseAdmin
                .schema('store')
                .from('customers')
                .insert({
                    auth_user_id: user.id,
                    email: user.email,
                    name: user.user_metadata?.name || 'User'
                })
                .select('id')
                .single();

            if (createError) {
                return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
            }
            customer = newCustomer;
        }

        // Check if already in wishlist (with same variant_id)
        let existingQuery = supabaseAdmin
            .schema('store')
            .from('wishlists')
            .select('id')
            .eq('customer_id', customer.id)
            .eq('product_id', product_id);

        if (variant_id) {
            existingQuery = existingQuery.eq('variant_id', variant_id);
        } else {
            existingQuery = existingQuery.is('variant_id', null);
        }

        const { data: existing } = await existingQuery.single();

        if (existing) {
            return NextResponse.json({ message: "Already in wishlist", id: existing.id });
        }

        // Add to wishlist
        const { data: wishlistItem, error } = await supabaseAdmin
            .schema('store')
            .from('wishlists')
            .insert({
                customer_id: customer.id,
                product_id,
                variant_id: variant_id || null
            })
            .select('id')
            .single();

        if (error) {
            console.error('[Wishlist POST] Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: wishlistItem.id });
    } catch (err: any) {
        console.error('[Wishlist POST] Exception:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE: Remove product/variant from wishlist
export async function DELETE(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const product_id = searchParams.get('product_id');
        const variant_id = searchParams.get('variant_id');

        if (!product_id) {
            return NextResponse.json({ error: "product_id is required" }, { status: 400 });
        }

        // Get customer
        const { data: customer } = await supabaseAdmin
            .schema('store')
            .from('customers')
            .select('id')
            .eq('auth_user_id', user.id)
            .single();

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        // Remove from wishlist
        let deleteQuery = supabaseAdmin
            .schema('store')
            .from('wishlists')
            .delete()
            .eq('customer_id', customer.id)
            .eq('product_id', parseInt(product_id));

        if (variant_id) {
            deleteQuery = deleteQuery.eq('variant_id', parseInt(variant_id));
        } else {
            deleteQuery = deleteQuery.is('variant_id', null);
        }

        const { error } = await deleteQuery;

        if (error) {
            console.error('[Wishlist DELETE] Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('[Wishlist DELETE] Exception:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
