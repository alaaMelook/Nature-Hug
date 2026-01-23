import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { NextResponse } from "next/server";

// POST: Merge duplicate customers
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { primaryId, duplicateId } = body;

        if (!primaryId || !duplicateId) {
            return NextResponse.json(
                { error: "Both primaryId and duplicateId are required" },
                { status: 400 }
            );
        }

        if (primaryId === duplicateId) {
            return NextResponse.json(
                { error: "Cannot merge a customer with itself" },
                { status: 400 }
            );
        }

        // 1. Get both customers
        const { data: primary, error: primaryError } = await supabaseAdmin
            .schema('store')
            .from('customers')
            .select('*')
            .eq('id', primaryId)
            .single();

        const { data: duplicate, error: duplicateError } = await supabaseAdmin
            .schema('store')
            .from('customers')
            .select('*')
            .eq('id', duplicateId)
            .single();

        if (primaryError || !primary) {
            return NextResponse.json(
                { error: "Primary customer not found" },
                { status: 404 }
            );
        }

        if (duplicateError || !duplicate) {
            return NextResponse.json(
                { error: "Duplicate customer not found" },
                { status: 404 }
            );
        }

        // 2. Update all orders from duplicate to primary
        const { error: ordersError } = await supabaseAdmin
            .schema('store')
            .from('orders')
            .update({ customer_id: primaryId })
            .eq('customer_id', duplicateId);

        if (ordersError) {
            console.error("[Merge Customers] Orders update error:", ordersError);
            return NextResponse.json(
                { error: "Failed to transfer orders" },
                { status: 500 }
            );
        }

        // 3. Merge customer info (fill missing fields from duplicate)
        const updateData: any = {};

        if (!primary.name && duplicate.name) {
            updateData.name = duplicate.name;
        }
        if (!primary.email && duplicate.email) {
            updateData.email = duplicate.email;
        }
        if (!primary.phone2 && duplicate.phone2) {
            updateData.phone2 = duplicate.phone2;
        }
        // If primary has no phone but duplicate does, use duplicate's phone as phone2
        if (!primary.phone2 && duplicate.phone && duplicate.phone !== primary.phone) {
            updateData.phone2 = duplicate.phone;
        }

        if (Object.keys(updateData).length > 0) {
            await supabaseAdmin
                .schema('store')
                .from('customers')
                .update(updateData)
                .eq('id', primaryId);
        }

        // 4. Merge addresses (copy duplicate's addresses to primary)
        const { data: duplicateAddresses } = await supabaseAdmin
            .schema('store')
            .from('customer_addresses')
            .select('address, governorate_slug')
            .eq('customer_id', duplicateId);

        if (duplicateAddresses && duplicateAddresses.length > 0) {
            // Get primary's existing addresses to avoid duplicates
            const { data: primaryAddresses } = await supabaseAdmin
                .schema('store')
                .from('customer_addresses')
                .select('address, governorate_slug')
                .eq('customer_id', primaryId);

            const existingAddrs = new Set(
                (primaryAddresses || []).map(a => `${a.address}-${a.governorate_slug}`)
            );

            const newAddresses = duplicateAddresses
                .filter(a => !existingAddrs.has(`${a.address}-${a.governorate_slug}`))
                .map(a => ({
                    customer_id: primaryId,
                    address: a.address,
                    governorate_slug: a.governorate_slug
                }));

            if (newAddresses.length > 0) {
                await supabaseAdmin
                    .schema('store')
                    .from('customer_addresses')
                    .insert(newAddresses);
            }
        }

        // 5. Get duplicate's address IDs to update orders referencing them
        const { data: duplicateAddressIds } = await supabaseAdmin
            .schema('store')
            .from('customer_addresses')
            .select('id')
            .eq('customer_id', duplicateId);

        if (duplicateAddressIds && duplicateAddressIds.length > 0) {
            const addressIds = duplicateAddressIds.map(a => a.id);

            // Update orders that reference these addresses to use null
            await supabaseAdmin
                .schema('store')
                .from('orders')
                .update({ shipping_address_id: null })
                .in('shipping_address_id', addressIds);
        }

        // 6. Delete duplicate's addresses (now safe since no orders reference them)
        await supabaseAdmin
            .schema('store')
            .from('customer_addresses')
            .delete()
            .eq('customer_id', duplicateId);

        // 6. Delete duplicate customer
        const { error: deleteError } = await supabaseAdmin
            .schema('store')
            .from('customers')
            .delete()
            .eq('id', duplicateId);

        if (deleteError) {
            console.error("[Merge Customers] Delete error:", deleteError);
            return NextResponse.json(
                { error: "Failed to delete duplicate customer" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Customer #${duplicateId} merged into #${primaryId}`,
            primaryId
        });

    } catch (err: any) {
        console.error("[Merge Customers] Exception:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// GET: Find duplicate customers (same phone number)
export async function GET(request: Request) {
    try {
        // Get all customers with their phone numbers
        const { data: customers, error } = await supabaseAdmin
            .schema('store')
            .from('customers')
            .select('id, name, phone, email, auth_user_id')
            .not('phone', 'is', null)
            .order('phone');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Group by phone number
        const phoneGroups: Record<string, any[]> = {};
        (customers || []).forEach(customer => {
            const phone = customer.phone?.trim();
            if (phone) {
                if (!phoneGroups[phone]) {
                    phoneGroups[phone] = [];
                }
                phoneGroups[phone].push(customer);
            }
        });

        // Filter to only groups with duplicates
        const duplicates = Object.entries(phoneGroups)
            .filter(([_, group]) => group.length > 1)
            .map(([phone, customers]) => ({
                phone,
                customers
            }));

        return NextResponse.json(duplicates);

    } catch (err: any) {
        console.error("[Merge Customers] GET Exception:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
