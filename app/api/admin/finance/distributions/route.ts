import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";

// ✅ GET: كل التوزيعات أو توزيع واحد
export async function GET(req: Request) {
  const supabase = supabase();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const { data, error } = await (await supabase)
      .from("partner_distributions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }

  const { data, error } = await (await supabase)
    .from("partner_distributions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// ✅ POST: إضافة توزيع جديد
export async function POST(req: Request) {
  const supabase = supabase();
  const body = await req.json();

  const { data, error } = await (await supabase)
    .from("partner_distributions")
    .insert([
      {
        partner_id: body.partner_id,
        period_start: body.period_start,
        period_end: body.period_end,
        profit_share: body.profit_share,
      },
    ])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
