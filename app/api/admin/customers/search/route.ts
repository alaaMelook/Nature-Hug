import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { NextResponse } from "next/server";
import { normalizePhone, phoneMatchVariants } from "@/lib/utils/phoneUtils";

// GET: Search customers by name, phone, phone2, or email
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q')?.trim();

        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        const results: any[] = [];

        // Detect if the query looks like a phone number
        const isPhoneSearch = /^[\d\+\s\-\(\)]{6,}$/.test(query);
        const phoneVariants = isPhoneSearch ? phoneMatchVariants(query) : [];

        // 1. Build OR filter — always search name, email, phone, AND phone2
        let orFilters: string[] = [];

        if (isPhoneSearch) {
            // For phone searches, search all format variants across phone AND phone2
            for (const variant of phoneVariants) {
                orFilters.push(`phone.ilike.%${variant}%`);
                orFilters.push(`phone2.ilike.%${variant}%`);
            }
            // Also search by name/email in case digits appear there
            orFilters.push(`name.ilike.%${query}%`);
        } else {
            // Text search: name, email, phone, phone2
            orFilters.push(`name.ilike.%${query}%`);
            orFilters.push(`phone.ilike.%${query}%`);
            orFilters.push(`phone2.ilike.%${query}%`);
            orFilters.push(`email.ilike.%${query}%`);
        }

        // 2. Search customers table
        const { data: customers, error: customersError } = await supabaseAdmin
            .schema('store')
            .from('customers')
            .select(`
                id,
                name,
                phone,
                phone2,
                email,
                auth_user_id,
                customer_addresses (
                    id,
                    address,
                    governorate_slug
                )
            `)
            .or(orFilters.join(','))
            .limit(10);

        if (!customersError && customers) {
            customers.forEach(customer => {
                // Only mark as 'registered' if they have an auth_user_id (actual account)
                const isRegistered = !!customer.auth_user_id;

                // Ensure primary phone is always populated — promote phone2 if phone is empty
                let primaryPhone = customer.phone || '';
                let secondaryPhone = customer.phone2 || '';
                if (!primaryPhone && secondaryPhone) {
                    primaryPhone = secondaryPhone;
                    secondaryPhone = '';
                }

                results.push({
                    type: isRegistered ? 'registered' : 'guest',
                    id: customer.id,
                    name: customer.name || '',
                    phone: primaryPhone,
                    phone2: secondaryPhone,
                    email: customer.email || '',
                    addresses: customer.customer_addresses || []
                });
            });
        }

        // 3. Search unique guests from orders (by phone) — with normalized deduplication
        let guestOrFilters: string[] = [];

        if (isPhoneSearch) {
            for (const variant of phoneVariants) {
                guestOrFilters.push(`guest_phone.ilike.%${variant}%`);
            }
            guestOrFilters.push(`guest_name.ilike.%${query}%`);
        } else {
            guestOrFilters.push(`guest_name.ilike.%${query}%`);
            guestOrFilters.push(`guest_phone.ilike.%${query}%`);
            guestOrFilters.push(`guest_email.ilike.%${query}%`);
        }

        const { data: orders, error: ordersError } = await supabaseAdmin
            .schema('store')
            .from('orders')
            .select('guest_name, guest_phone, guest_phone2, guest_email, guest_address')
            .or(guestOrFilters.join(','))
            .not('guest_phone', 'is', null)
            .order('created_at', { ascending: false })
            .limit(20);

        if (!ordersError && orders) {
            // Use normalized phones for deduplication
            const seenNormalizedPhones = new Set<string>();
            const registeredNormalizedPhones = new Set(
                results.map(r => normalizePhone(r.phone))
            );

            orders.forEach(order => {
                const phone = order.guest_phone;
                if (!phone) return;

                const normPhone = normalizePhone(phone);
                if (seenNormalizedPhones.has(normPhone) || registeredNormalizedPhones.has(normPhone)) {
                    return;
                }
                seenNormalizedPhones.add(normPhone);

                // Parse guest_address if it's JSON
                let addressInfo = null;
                if (order.guest_address) {
                    try {
                        addressInfo = typeof order.guest_address === 'string'
                            ? JSON.parse(order.guest_address)
                            : order.guest_address;
                    } catch (e) {
                        addressInfo = { address: order.guest_address };
                    }
                }

                results.push({
                    type: 'guest',
                    id: null,
                    name: order.guest_name || '',
                    phone: order.guest_phone || '',
                    phone2: order.guest_phone2 || '',
                    email: order.guest_email || '',
                    addresses: addressInfo ? [{
                        address: addressInfo.address || '',
                        governorate_slug: addressInfo.governorate_slug || ''
                    }] : []
                });
            });
        }

        return NextResponse.json(results.slice(0, 15));
    } catch (err: any) {
        console.error("[Customer Search] Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
