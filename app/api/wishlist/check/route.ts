import { createSupabaseServerClient } from "@/data/datasources/supabase/server";
import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { NextResponse } from "next/server";

// GET: Check if product/variant is in user's wishlist
export async function GET(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ inWishlist: false });
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
            return NextResponse.json({ inWishlist: false });
        }

        // Check if in wishlist
        let query = supabaseAdmin
            .schema('store')
            .from('wishlists')
            .select('id')
            .eq('customer_id', customer.id)
            .eq('product_id', parseInt(product_id));

        if (variant_id) {
            query = query.eq('variant_id', parseInt(variant_id));
        } else {
            query = query.is('variant_id', null);
        }

        const { data: existing } = await query.single();

        return NextResponse.json({ inWishlist: !!existing });
    } catch (err: any) {
        console.error('[Wishlist Check] Exception:', err);
        return NextResponse.json({ inWishlist: false });
    }
}
