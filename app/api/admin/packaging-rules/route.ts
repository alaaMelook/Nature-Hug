import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/data/datasources/supabase/admin";

// GET - Fetch all packaging rules with material names and product associations
export async function GET() {
    try {
        // 1. Get all packaging rules with material info
        const { data: rules, error } = await supabaseAdmin.schema('admin')
            .from('packaging_rules')
            .select('*, materials!inner(name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("[PackagingRules API] GET error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 2. Get product associations for all rules
        const ruleIds = (rules || []).map(r => r.id);
        let ruleProductsMap: Record<number, number[]> = {};
        let productNamesMap: Record<number, string> = {};

        if (ruleIds.length > 0) {
            const { data: ruleProducts } = await supabaseAdmin.schema('admin')
                .from('packaging_rule_products')
                .select('rule_id, product_id')
                .in('rule_id', ruleIds);

            if (ruleProducts) {
                for (const rp of ruleProducts) {
                    if (!ruleProductsMap[rp.rule_id]) ruleProductsMap[rp.rule_id] = [];
                    ruleProductsMap[rp.rule_id].push(rp.product_id);
                }

                // Get product names
                const allProductIds = [...new Set(ruleProducts.map(rp => rp.product_id))];
                if (allProductIds.length > 0) {
                    const { data: products } = await supabaseAdmin.schema('store')
                        .from('products')
                        .select('id, name_en, name_ar')
                        .in('id', allProductIds);

                    if (products) {
                        for (const p of products) {
                            productNamesMap[p.id] = p.name_en || p.name_ar || `Product ${p.id}`;
                        }
                    }
                }
            }
        }

        // 3. Build response
        const result = (rules || []).map(rule => ({
            id: rule.id,
            material_id: rule.material_id,
            material_name: rule.materials?.name || '',
            deduction_type: rule.deduction_type,
            applies_to: rule.applies_to,
            quantity_single: rule.quantity_single,
            quantity_multiple: rule.quantity_multiple,
            is_active: rule.is_active,
            product_ids: ruleProductsMap[rule.id] || [],
            product_names: (ruleProductsMap[rule.id] || []).map(pid => productNamesMap[pid] || `Product ${pid}`),
            created_at: rule.created_at,
        }));

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[PackagingRules API] GET unexpected error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create or update a packaging rule
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, material_id, deduction_type, applies_to, quantity_single, quantity_multiple, is_active, product_ids } = body;

        if (!material_id) {
            return NextResponse.json({ error: "material_id is required" }, { status: 400 });
        }

        let ruleId = id;

        if (id) {
            // UPDATE existing rule
            const { error } = await supabaseAdmin.schema('admin')
                .from('packaging_rules')
                .update({
                    material_id,
                    deduction_type: deduction_type || 'per_order',
                    applies_to: applies_to || 'all',
                    quantity_single: quantity_single ?? 0,
                    quantity_multiple: quantity_multiple ?? 0,
                    is_active: is_active ?? true,
                })
                .eq('id', id);

            if (error) {
                console.error("[PackagingRules API] UPDATE error:", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        } else {
            // INSERT new rule
            const { data, error } = await supabaseAdmin.schema('admin')
                .from('packaging_rules')
                .insert({
                    material_id,
                    deduction_type: deduction_type || 'per_order',
                    applies_to: applies_to || 'all',
                    quantity_single: quantity_single ?? 0,
                    quantity_multiple: quantity_multiple ?? 0,
                    is_active: is_active ?? true,
                })
                .select('id')
                .single();

            if (error) {
                console.error("[PackagingRules API] INSERT error:", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            ruleId = data.id;
        }

        // Update product associations
        if (applies_to === 'specific' && product_ids) {
            // Delete existing
            await supabaseAdmin.schema('admin')
                .from('packaging_rule_products')
                .delete()
                .eq('rule_id', ruleId);

            // Insert new
            if (product_ids.length > 0) {
                const records = product_ids.map((pid: number) => ({
                    rule_id: ruleId,
                    product_id: pid,
                }));

                const { error: prodError } = await supabaseAdmin.schema('admin')
                    .from('packaging_rule_products')
                    .insert(records);

                if (prodError) {
                    console.error("[PackagingRules API] product association error:", prodError);
                }
            }
        } else if (applies_to === 'all') {
            // Clear product associations if switching to 'all'
            await supabaseAdmin.schema('admin')
                .from('packaging_rule_products')
                .delete()
                .eq('rule_id', ruleId);
        }

        return NextResponse.json({ success: true, id: ruleId });
    } catch (error: any) {
        console.error("[PackagingRules API] POST unexpected error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Remove a packaging rule
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "id is required" }, { status: 400 });
        }

        // Delete product associations first
        await supabaseAdmin.schema('admin')
            .from('packaging_rule_products')
            .delete()
            .eq('rule_id', parseInt(id));

        // Delete the rule
        const { error } = await supabaseAdmin.schema('admin')
            .from('packaging_rules')
            .delete()
            .eq('id', parseInt(id));

        if (error) {
            console.error("[PackagingRules API] DELETE error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[PackagingRules API] DELETE unexpected error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
