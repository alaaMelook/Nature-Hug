import { createSupabaseServerClient as createClient } from '@/data/datasources/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST: Create order as distributor
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is a distributor
        const { data: member } = await supabase
            .from('members')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (!member || member.role !== 'distributor') {
            return NextResponse.json({ error: 'Not a distributor' }, { status: 403 });
        }

        // Get distributor's customer ID
        const { data: customer } = await supabase
            .from('customers')
            .select('id')
            .eq('auth_user_id', user.id)
            .single();

        if (!customer) {
            return NextResponse.json({ error: 'Distributor profile not found' }, { status: 404 });
        }

        const body = await request.json();

        // --- Server-Side Recalculation ---
        const items = body.items || [];
        const productIds = items.map((i: any) => i.product_id);

        // Fetch fresh product prices using the view (same as IProductRepository)
        // We use the english view for consistency, assuming prices are currency-agnostic or base is EGP
        const { data: dbProducts } = await supabase
            .schema('store')
            .from('products_view_en')
            .select('product_id, price')
            .in('product_id', productIds);

        let calculatedSubtotal = 0;
        const verifiedItems = [];

        for (const item of items) {
            const dbProduct = dbProducts?.find((p: any) => p.product_id === item.product_id);
            if (!dbProduct) {
                console.warn(`Product not found: ${item.product_id}`);
                continue;
            }

            const unitPrice = dbProduct.price;
            const lineTotal = unitPrice * item.quantity;
            calculatedSubtotal += lineTotal;

            verifiedItems.push({
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                unit_price: unitPrice,
                discount: 0
            });
        }

        if (verifiedItems.length === 0) {
            return NextResponse.json({ error: 'No valid items found' }, { status: 400 });
        }

        // Calculate Shipping
        let calculatedShipping = 0;
        const govSlug = body.guest_address?.governorate_slug;
        if (govSlug) {
            const { data: gov } = await supabase.schema('store').from('governorates').select('fees').eq('slug', govSlug).single();
            if (gov) calculatedShipping = gov.fees;
        }

        // Calculate Totals
        // Distributors don't have promo codes yet
        const calculatedDiscount = 0;
        const calculatedGrandTotal = calculatedSubtotal + calculatedShipping - calculatedDiscount;

        console.log(`[Distributor Order] Recalculated: Sub=${calculatedSubtotal}, Ship=${calculatedShipping}, Total=${calculatedGrandTotal}`);

        // Create order using RPC
        const { data: orderResult, error: orderError } = await supabase.rpc('create_order', {
            p_guest_name: body.guest_name,
            p_guest_phone: body.guest_phone,
            p_guest_phone2: body.guest_phone2,
            p_guest_email: null,
            p_address: body.guest_address.address,
            p_governorate_slug: body.guest_address.governorate_slug,
            p_subtotal: calculatedSubtotal,
            p_discount_total: calculatedDiscount,
            p_shipping_total: calculatedShipping,
            p_tax_total: 0,
            p_grand_total: calculatedGrandTotal,
            p_payment_method: 'COD',
            p_payment_status: 'pending',
            p_status: 'pending',
            p_note: null,
            p_promo_code_id: null,
            p_items: verifiedItems,
        });

        if (orderError) {
            console.error('Order creation error:', orderError);
            return NextResponse.json({ error: orderError.message }, { status: 500 });
        }

        // Update order with distributor ID
        if (orderResult?.order_id) {
            await supabase
                .from('orders')
                .update({ created_by_distributor_id: customer.id })
                .eq('id', orderResult.order_id);
        }

        return NextResponse.json({
            order_id: orderResult?.order_id,
            success: true
        });

    } catch (error) {
        console.error('Distributor order error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

// GET: Fetch distributor's orders
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get distributor's customer ID
        const { data: customer } = await supabase
            .from('customers')
            .select('id')
            .eq('auth_user_id', user.id)
            .single();

        if (!customer) {
            return NextResponse.json({ error: 'Distributor profile not found' }, { status: 404 });
        }

        // Fetch orders created by this distributor
        const { data: orders, error } = await supabase
            .from('order_details')
            .select('*')
            .eq('created_by_distributor_id', customer.id)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(orders || []);

    } catch (error) {
        console.error('Fetch distributor orders error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
