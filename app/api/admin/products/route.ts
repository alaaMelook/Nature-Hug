// /app/api/products/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";

export async function GET() {
  const supabase = await supabase();

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name_english,
      stock,
      price,
      product_materials (
        grams_used,
        materials (
          id,
          name,
          stock_grams,
          price_per_gram
        )
      )
    `);

  if (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}
