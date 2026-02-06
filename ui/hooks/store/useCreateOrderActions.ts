'use server'

import { revalidatePath } from 'next/cache'
import { Order } from "@/domain/entities/database/order";
import { CartItem } from "@/domain/entities/views/shop/productView";
import { OrderItem } from "@/domain/entities/database/orderItem";
import { CreateOrder } from "@/domain/use-case/store/createOrder";
import { cookies } from "next/headers";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";
import { sendOrderNotificationTelegram } from "@/lib/services/telegramService";
import { IProductServerRepository } from "@/data/repositories/server/iProductsRepository";
import { ValidatePromoCode } from "@/domain/use-case/store/validatePromoCode";
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";

export async function createOrder(data: Partial<Order>, isAdmin: boolean, items: CartItem[]) {
    console.log(`[createOrder] START - Client sent: promo_code_id=${data.promo_code_id}, discount_total=${data.discount_total}, subtotal=${data.subtotal}, grand_total=${data.grand_total}`);

    if (!data.customer_id && (!data.guest_name || !data.guest_phone || !data.guest_address)) {
        return { error: 'Missing required guest information' };
    }
    const user = await new GetCurrentUser().getAnonymousSessionId();

    // --- Server-Side Recalculation & Validation ---
    const productRepo = new IProductServerRepository();
    // 1. Fetch fresh product data to get accurate prices
    const itemSlugs = items.map(i => i.slug);
    const dbProducts = await productRepo.viewBySlugs(itemSlugs);

    if (items.length > 0 && dbProducts.length === 0) {
        return { error: 'One or more products in cart not found.' };
    }

    let calculatedSubtotal = 0;
    const verifiedItems: Partial<OrderItem>[] = [];

    // Map items to Verified Order Items with DB prices
    for (const item of items) {
        const dbProduct = dbProducts.find(p => p.slug === item.slug);
        if (!dbProduct) {
            console.warn(`Product not found during checkout: ${item.slug}`);
            continue; // Or throw error
        }

        // Use price from DB. 
        const unitPrice = dbProduct.price;
        const lineTotal = unitPrice * item.quantity;
        calculatedSubtotal += lineTotal;

        verifiedItems.push({
            product_id: dbProduct.id || dbProduct.product_id, // Handle view structure variability
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: unitPrice,
            discount: 0 // Will be distributed later if needed, or kept 0 and discount applied to order total
        });
    }

    // 2. Validate Promo Code & Calculate Discount
    let calculatedDiscount = 0;
    let freeShipping = false;
    let verifiedPromoCodeId = null;
    let appliedPromoCodeName = null;

    console.log(`[createOrder] Checking promo: promo_code_id=${data.promo_code_id}, client_discount=${data.discount_total}, applied_promo_codes=${JSON.stringify(data.applied_promo_codes)}`);

    // If we have applied_promo_codes array, use that for discount calculation
    if (data.applied_promo_codes && Array.isArray(data.applied_promo_codes) && data.applied_promo_codes.length > 0) {
        // Sum discounts from all applied promo codes
        calculatedDiscount = data.applied_promo_codes.reduce((sum: number, p: any) => sum + (p.discount || 0), 0);
        freeShipping = data.applied_promo_codes.some((p: any) => p.free_shipping === true);
        console.log(`[createOrder] Using applied_promo_codes: totalDiscount=${calculatedDiscount}, freeShipping=${freeShipping}`);
    } else if (data.promo_code_id || (items.length > 0 && data.discount_total && data.discount_total > 0)) {
        // Legacy: Single promo code flow
        if (data.promo_code_id) {
            const supabase = await createSupabaseServerClient();
            const { data: promoData, error: promoError } = await supabase.schema('store').from('promo_codes').select('*').eq('id', data.promo_code_id).single();

            console.log(`[createOrder] Fetched promo code: ${JSON.stringify(promoData)}, error: ${promoError?.message || 'none'}`);

            if (promoData && promoData.is_active) {
                // Determine normalized items for validation
                const validationItems = items.map(i => ({ slug: i.slug, quantity: i.quantity }));
                console.log(`[createOrder] Validating promo: code=${promoData.code}, percentage=${promoData.percentage_off}, amount=${promoData.amount_off}, all_cart=${promoData.all_cart}`);

                // Convert null customer_id to undefined for ValidatePromoCode
                const customerId = data.customer_id ?? undefined;
                const validationResult = await new ValidatePromoCode().execute(promoData.code, validationItems, customerId);

                console.log(`[createOrder] Validation result: isValid=${validationResult.isValid}, discount=${'discount' in validationResult ? validationResult.discount : 'N/A'}, error=${'error' in validationResult ? validationResult.error : 'none'}`);

                if (validationResult.isValid && 'discount' in validationResult) {
                    calculatedDiscount = validationResult.discount ?? 0;
                    verifiedPromoCodeId = promoData.id;
                    appliedPromoCodeName = promoData.code;
                    // Check for free shipping
                    if (promoData.free_shipping) {
                        freeShipping = true;
                    }
                } else {
                    // Validation failed but client sent a discount - log but still use client value as fallback
                    // This handles edge cases where validation might fail on server but discount was shown to user
                    console.warn(`[createOrder] Promo validation failed, using client discount as fallback: ${data.discount_total}`);
                    calculatedDiscount = data.discount_total || 0;
                    verifiedPromoCodeId = data.promo_code_id;
                }
            }
        } else if (data.discount_total && data.discount_total > 0) {
            // No promo_code_id but client has discount (edge case)
            console.warn(`[createOrder] No promo_code_id but client sent discount=${data.discount_total}`);
            calculatedDiscount = data.discount_total;
        }
    }

    // 3. Calculate Shipping
    // First, check if any of the applied_promo_codes has free_shipping
    let calculatedShipping = 0;
    const hasFreeShippingFromAppliedPromos = data.applied_promo_codes?.some((p: any) => p.free_shipping === true) ?? false;

    console.log(`[createOrder] Free shipping check - freeShipping from promo_code_id: ${freeShipping}, from applied_promo_codes: ${hasFreeShippingFromAppliedPromos}`);

    // For admin orders, use the shipping_total passed from the client
    // For regular orders, calculate shipping unless free shipping applies
    if (isAdmin) {
        // Admin orders: use the shipping value from the client
        calculatedShipping = data.shipping_total ?? 0;
        console.log(`[createOrder] Admin order - using client shipping_total: ${calculatedShipping}`);
    } else if (!freeShipping && !hasFreeShippingFromAppliedPromos) {
        const supabase = await createSupabaseServerClient();
        let govSlug = data.guest_address?.governorate_slug;

        // If using saved address (shipping_address_id), fetch its governorate
        if (data.shipping_address_id && !govSlug) {
            const { data: addr } = await supabase.schema('auth').from('addresses').select('governorate_id').eq('id', data.shipping_address_id).single();
            if (addr && addr.governorate_id) {
                // Need governorate fees.
                const { data: gov } = await supabase.schema('store').from('governorates').select('fees').eq('id', addr.governorate_id).single();
                if (gov) calculatedShipping = gov.fees;
            }
        } else if (govSlug) {
            const { data: gov } = await supabase.schema('store').from('governorates').select('fees').eq('slug', govSlug).single();
            if (gov) calculatedShipping = gov.fees;
        }
    }

    // 4. Calculate Final Total
    const calculatedGrandTotal = Math.max(0, calculatedSubtotal + calculatedShipping - calculatedDiscount);

    // Use Server-Calculated values
    const sentOrder: Partial<Order> = {
        ...data,
        subtotal: calculatedSubtotal,         // Recalculated
        shipping_total: calculatedShipping,   // Recalculated
        discount_total: calculatedDiscount,   // Recalculated
        grand_total: calculatedGrandTotal,    // Recalculated
        sessionId: isAdmin ? null : user,
        items: verifiedItems,
        promo_code_id: verifiedPromoCodeId || data.promo_code_id
    };

    let cookie = await cookies();
    console.log("[createOrder] user_id:", user);
    console.log(`[createOrder] Recalculated: Sub=${calculatedSubtotal}, Ship=${calculatedShipping}, Disc=${calculatedDiscount}, Total=${calculatedGrandTotal}, Code=${appliedPromoCodeName}`);
    console.log(`[createOrder] FINAL sentOrder.discount_total = ${sentOrder.discount_total}, sentOrder.grand_total = ${sentOrder.grand_total}`);

    try {
        const createdOrder = await new CreateOrder().execute(sentOrder);

        // WORKAROUND: Direct update to ensure discount_total and grand_total are saved correctly
        // This is needed because the RPC might not be extracting these values from order_data JSON
        if (calculatedDiscount > 0 || calculatedGrandTotal !== calculatedSubtotal) {
            const supabase = await createSupabaseServerClient();
            const { error: updateError } = await supabase.schema('store')
                .from('orders')
                .update({
                    discount_total: calculatedDiscount,
                    grand_total: calculatedGrandTotal,
                    shipping_total: calculatedShipping,
                    applied_promo_codes: data.applied_promo_codes || null
                })
                .eq('id', createdOrder.order_id);

            if (updateError) {
                console.error('[createOrder] Failed to update order totals:', updateError);
            } else {
                console.log(`[createOrder] Successfully updated order ${createdOrder.order_id} with discount=${calculatedDiscount}, total=${calculatedGrandTotal}`);
            }
        }

        cookie.set({
            name: 'fromCheckout',
            value: 'true',
            httpOnly: true,
            path: '/',
            maxAge: 30
        });
        cookie.set({
            name: 'customer',
            value: createdOrder.customer_id.toString(),
            httpOnly: true,
            path: '/',
            maxAge: 60 * 30
        });

        // Send push notification via Telegram
        const customerName = data.guest_name || 'Customer';
        const totalAmount = sentOrder.grand_total || 0;
        const itemsForNotification = items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price - (item.discount || 0)
        }));

        sendOrderNotificationTelegram({
            orderId: createdOrder.order_id,
            customerName,
            totalAmount,
            phone: data.guest_phone,
            governorate: data.guest_address?.governorate_slug,
            address: data.guest_address?.address,
            items: itemsForNotification
        }).catch(err => console.error("[Telegram] Failed to send notification:", err));

        revalidatePath('/', 'layout');
        return { order_id: createdOrder.order_id }
    }
    catch (error) {
        console.error(error);
        return { error: 'Failed to create order' };
    }
}
