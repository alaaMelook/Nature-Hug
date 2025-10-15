import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/supabase/server";

export async function GET() {
  const supabase = await supabase();

  const { data: categories, error } = await supabase
    .from("overhead_categories")
    .select("id, name, overheads(id, name, amount, depreciation_rate, category_id)");

  if (error) {
    console.error("Error fetching cost data:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: categories });
}
