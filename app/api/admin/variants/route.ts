import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// 🟢 GET Variants (اختياري: ممكن تبعتي product_id في الكويري)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("product_id");

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("product_variants")
    .select(`
      id,
      name,
      product_id,
      product:products(id, name_english)
    `);

  if (productId) query = query.eq("product_id", productId);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
