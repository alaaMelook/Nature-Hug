// app/api/admin/product-materials/route.ts
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("product_materials")
    .select(`
      id,
      product_id,
      material_id,
      grams_used,
      materials(name, price_per_gram)
    `)
    .eq("product_id", productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // map to BOMRow format
  const result = (data || []).map((row: any) => ({
    id: row.id,
    product_id: row.product_id,
    material_id: row.material_id,
    material_name: row.materials?.name ?? "",
    grams_used: row.grams_used,
    unit_cost: row.materials?.price_per_gram ?? 0,
    total_cost: (row.materials?.price_per_gram ?? 0) * row.grams_used,
  }));

  return NextResponse.json({ data: result });
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();
  const { product_id, material_id, grams_used } = body;

  if (!product_id || !material_id || !grams_used) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("product_materials")
    .insert([{ product_id, material_id, grams_used }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: {
      id: data.id,
      product_id: data.product_id,
      material_id: data.material_id,
      material_name: (await supabase.from("materials").select("name, price_per_gram").eq("id", material_id).single()).data?.name ?? "",
      grams_used: data.grams_used,
      unit_cost: (await supabase.from("materials").select("price_per_gram").eq("id", material_id).single()).data?.price_per_gram ?? 0,
      total_cost: data.grams_used * ((await supabase.from("materials").select("price_per_gram").eq("id", material_id).single()).data?.price_per_gram ?? 0),
    },
  });
}
