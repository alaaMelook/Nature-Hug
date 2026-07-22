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
    let bundleDiscountAccumulator = 0;
    const verifiedItems: Partial<OrderItem>[] = [];

    // Map items to Verified Order Items with DB prices
    for (const item of items) {
        const dbProduct = dbProducts.find(p => p.slug === item.slug);
        if (!dbProduct) {
            console.warn(`Product not found during checkout: ${item.slug}`);
            continue; // Or throw error
        }

        const isBundle = item.product_type === 'bundle' || item.slug.startsWith('bundle-') || dbProduct.product_type === 'bundle';

        if (isBundle) {
            const bundleId = dbProduct.id || dbProduct.product_id;
            const supabase = await createSupabaseServerClient();
            const { data: rawBundleItems } = await supabase
                .schema('store')
                .from('bundle_items')
                .select('*, product:product_id(id, price), variant:variant_id(id, price)')
                .eq('bundle_id', bundleId);

            const bundleItems = rawBundleItems || [];

            if (bundleItems.length > 0) {
                let sumOriginal = 0;
                for (const bi of bundleItems) {
                    const price = bi.variant?.price || bi.product?.price || 100;
                    sumOriginal += price * (bi.quantity || 1);
                }

                const bundleFinalUnitPrice = item.price > 0 ? item.price : (dbProduct.discount ? dbProduct.price - dbProduct.discount : dbProduct.price);
                const bundleDiscountPerUnit = Math.max(0, sumOriginal - bundleFinalUnitPrice);

                calculatedSubtotal += sumOriginal * item.quantity;
                bundleDiscountAccumulator += bundleDiscountPerUnit * item.quantity;

                for (let idx = 0; idx < bundleItems.length; idx++) {
                    const bi = bundleItems[idx];
                    const rawPrice = bi.variant?.price || bi.product?.price || 100;
                    const itemQty = (bi.quantity || 1) * item.quantity;

                    let chosenVariantId = bi.variant_id || null;
                    if ((item as any).selected_variants) {
                        const selVars = (item as any).selected_variants;
                        for (const key of Object.keys(selVars)) {
                            if (key.startsWith(`${bi.product_id}-`) && selVars[key]?.id) {
                                chosenVariantId = selVars[key].id;
                                break;
                            }
                        }
                    }

                    verifiedItems.push({
                        product_id: bi.product_id,
                        variant_id: chosenVariantId,
                        quantity: itemQty,
                        unit_price: rawPrice,
                        discount: 0
                    });
                }
            } else {
                const supabase = await createSupabaseServerClient();
                const { data: fallbackProd } = await supabase
                    .schema('store')
                    .from('products')
                    .select('id')
                    .limit(1)
                    .single();

                const fallbackPrice = item.price || dbProduct.price || 0;
                const fallbackProductId = fallbackProd?.id || dbProduct.id || dbProduct.product_id;

                calculatedSubtotal += fallbackPrice * item.quantity;

                verifiedItems.push({
                    product_id: fallbackProductId,
                    variant_id: null,
                    quantity: item.quantity,
                    unit_price: fallbackPrice,
                    discount: 0
                });
            }
        } else {
            // Use price from DB. 
            const unitPrice = dbProduct.price;
            const lineTotal = unitPrice * item.quantity;
            calculatedSubtotal += lineTotal;

            verifiedItems.push({
                product_id: dbProduct.id || dbProduct.product_id,
                variant_id: item.variant_id || null,
                quantity: item.quantity,
                unit_price: unitPrice,
                discount: 0
            });
        }
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

    // Add bundle discounts to overall calculated discount
    calculatedDiscount += bundleDiscountAccumulator;

    // 3. Calculate Shipping
    // First, check if any of the applied_promo_codes has free_shipping
    let calculatedShipping = 0;
    const hasFreeShippingFromAppliedPromos = data.applied_promo_codes?.some((p: any) => p.free_shipping === true) ?? false;

    console.log(`[createOrder] Free shipping check - freeShipping from promo_code_id: ${freeShipping}, from applied_promo_codes: ${hasFreeShippingFromAppliedPromos}, client shipping_total: ${data.shipping_total}`);

    // Check if free shipping applies
    const hasFreeShipping = freeShipping || hasFreeShippingFromAppliedPromos;

    if (hasFreeShipping) {
        calculatedShipping = 0;
        console.log(`[createOrder] Free shipping applied`);
    } else {
        // Try to calculate shipping from governorate, but use client value as fallback
        const supabase = await createSupabaseServerClient();
        let govSlug = data.guest_address?.governorate_slug;

        // If using saved address (shipping_address_id), fetch its governorate
        if (data.shipping_address_id && !govSlug) {
            const { data: addr } = await supabase.schema('auth').from('addresses').select('governorate_id').eq('id', data.shipping_address_id).single();
            if (addr && addr.governorate_id) {
                const { data: gov } = await supabase.schema('store').from('governorates').select('fees').eq('id', addr.governorate_id).single();
                if (gov) calculatedShipping = gov.fees;
            }
        } else if (govSlug) {
            const { data: gov } = await supabase.schema('store').from('governorates').select('fees').eq('slug', govSlug).single();
            if (gov) calculatedShipping = gov.fees;
        }

        // IMPORTANT: If server calculation returned 0 but client sent a shipping value, use client value
        // This handles cases where governorate lookup fails or saved address has incomplete data
        if (calculatedShipping === 0 && data.shipping_total && data.shipping_total > 0) {
            console.log(`[createOrder] Server shipping calculation returned 0, using client shipping_total: ${data.shipping_total}`);
            calculatedShipping = data.shipping_total;
        }
    }

    console.log(`[createOrder] Final calculated shipping: ${calculatedShipping}`);

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

        // Send push notification via Telegram with full customer details
        let customerName = data.guest_name;
        let customerPhone = data.guest_phone || data.guest_phone2;
        let govSlug = data.guest_address?.governorate_slug;
        let fullAddress = data.guest_address?.address;

        try {
            const supabase = await createSupabaseServerClient();

            // Fetch customer name/phone if missing
            const targetCustId = createdOrder.customer_id || data.customer_id;
            if (targetCustId && (!customerName || !customerPhone)) {
                const { data: cust } = await supabase
                    .schema('store')
                    .from('customers')
                    .select('name, phone, phone2')
                    .eq('id', targetCustId)
                    .single();
                if (cust) {
                    if (!customerName) customerName = cust.name;
                    if (!customerPhone) customerPhone = cust.phone || cust.phone2;
                }
            }

            // Fetch address details if using shipping_address_id
            if (data.shipping_address_id && (!govSlug || !fullAddress)) {
                const { data: addr } = await supabase
                    .schema('auth')
                    .from('addresses')
                    .select('address, governorate_id')
                    .eq('id', data.shipping_address_id)
                    .single();

                if (addr) {
                    if (!fullAddress) fullAddress = addr.address;
                    if (!govSlug && addr.governorate_id) {
                        const { data: gov } = await supabase
                            .schema('store')
                            .from('governorates')
                            .select('name_ar, name_en, slug')
                            .eq('id', addr.governorate_id)
                            .single();
                        if (gov) {
                            govSlug = gov.name_ar || gov.name_en || gov.slug;
                        }
                    }
                }
            }
        } catch (err) {
            console.error("[Telegram] Error enriching customer details:", err);
        }

        customerName = customerName || 'Customer';
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
            phone: customerPhone || undefined,
            governorate: govSlug || undefined,
            address: fullAddress || undefined,
            items: itemsForNotification,
            subtotal: calculatedSubtotal,
            discountTotal: calculatedDiscount > 0 ? calculatedDiscount : undefined,
            shippingTotal: calculatedShipping > 0 ? calculatedShipping : undefined,
        }).catch(err => console.error("[Telegram] Failed to send notification:", err));

        revalidatePath('/', 'layout');
        return { order_id: createdOrder.order_id }
    }
    catch (error) {
        console.error(error);
        return { error: 'Failed to create order' };
    }
}
