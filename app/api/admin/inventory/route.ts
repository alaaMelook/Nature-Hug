import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("materials")
    .select("id, name, stock_grams, price_per_gram, created_at, updated_at");

  if (error) {
    console.error("Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).map((m) => ({
    ...m,
    total_value: Number(m.stock_grams) * Number(m.price_per_gram),
  }));

  return NextResponse.json(rows);
}