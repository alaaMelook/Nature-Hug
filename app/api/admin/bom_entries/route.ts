import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Helper: format row
function formatRow(row: any) {
  return {
    id: row.id,
    isVariant: !!row.variant, // true لو مربوطة ب variant
    product_id: row.product?.id || row.variant?.product_id || null,
    product_name: row.product?.name_english || "",
    variant_id: row.variant?.id || null,
    variant_name: row.variant?.name || "",
    material_id: row.material?.id || null,
    material_name: row.material?.name || "",
    material_type: row.material?.material_type || "normal",
    grams_used: row.grams_used,
    unit_cost: row.material?.price_per_gram ?? 0,
    total_cost: row.grams_used * (row.material?.price_per_gram ?? 0),
  };
}

// 🟢 Get all BOM entries
export async function GET(req: Request) {
  const url = new URL(req.url, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const productId = url.searchParams.get("product_id");
  const variantId = url.searchParams.get("variant_id");

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("product_materials")
    .select(`
      id,
      grams_used,
      product:products(id, name_english),
      variant:product_variants(id, name, product_id),
      material:materials(id, name, price_per_gram, material_type)
    `);

  if (variantId) {
    query = query.eq("variant_id", variantId);
  } else if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: (data || []).map(formatRow) });
}

// 🟢 Add new BOM entry
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();
  const { product_id, variant_id, material_id, grams_used } = body;

  if (!product_id && !variant_id) {
    return NextResponse.json(
      { success: false, error: "Either product_id or variant_id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("product_materials")
    .insert([{ product_id, variant_id, material_id, grams_used }])
    .select(`
      id,
      grams_used,
      product:products(id, name_english),
      variant:product_variants(id, name, product_id),
      material:materials(id, name, price_per_gram, material_type)
    `);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: formatRow(data[0]) });
}

// 🟡 Update grams_used
export async function PUT(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();
  const { id, grams_used } = body;

  if (!id || grams_used === undefined) {
    return NextResponse.json(
      { success: false, error: "Missing id or grams_used" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("product_materials")
    .update({ grams_used })
    .eq("id", id)
    .select(`
      id,
      grams_used,
      product:products(id, name_english),
      variant:product_variants(id, name, product_id),
      material:materials(id, name, price_per_gram, material_type)
    `)
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: formatRow(data) });
}

// 🔴 Delete entry
export async function DELETE(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  }

  const { error } = await supabase.from("product_materials").delete().eq("id", id);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
