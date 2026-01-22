import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { NextResponse } from "next/server";

// GET: Search customers by name, phone, or email
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q')?.trim();

        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        const results: any[] = [];

        // 1. Search customers (check if they have auth_user_id to determine if registered)
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
            .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
            .limit(10);

        if (!customersError && customers) {
            customers.forEach(customer => {
                // Only mark as 'registered' if they have an auth_user_id (actual account)
                const isRegistered = !!customer.auth_user_id;
                results.push({
                    type: isRegistered ? 'registered' : 'guest',
                    id: customer.id,
                    name: customer.name || '',
                    phone: customer.phone || '',
                    phone2: customer.phone2 || '',
                    email: customer.email || '',
                    addresses: customer.customer_addresses || []
                });
            });
        }

        // 2. Search unique guests from orders (by phone)
        const { data: orders, error: ordersError } = await supabaseAdmin
            .schema('store')
            .from('orders')
            .select('guest_name, guest_phone, guest_phone2, guest_email, guest_address')
            .or(`guest_name.ilike.%${query}%,guest_phone.ilike.%${query}%,guest_email.ilike.%${query}%`)
            .not('guest_phone', 'is', null)
            .order('created_at', { ascending: false })
            .limit(20);

        if (!ordersError && orders) {
            // Get unique guests by phone
            const seenPhones = new Set<string>();
            const registeredPhones = new Set(results.map(r => r.phone));

            orders.forEach(order => {
                const phone = order.guest_phone;
                if (phone && !seenPhones.has(phone) && !registeredPhones.has(phone)) {
                    seenPhones.add(phone);

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
                }
            });
        }

        return NextResponse.json(results.slice(0, 15));
    } catch (err: any) {
        console.error("[Customer Search] Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
