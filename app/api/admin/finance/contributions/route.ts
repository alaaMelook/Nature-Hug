import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/supabase/server";

// GET: كل المساهمات لشريك معين
export async function GET(req: Request) {
  const supabase = supabase();
  const { searchParams } = new URL(req.url);
  const partner_id = searchParams.get("partner_id");

  if (!partner_id) {
    return NextResponse.json({ error: "partner_id is required" }, { status: 400 });
  }

  const { data, error } = await (await supabase)
    .from("partner_contributions")
    .select("*")
    .eq("partner_id", partner_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// POST: إضافة مساهمة لشريك
export async function POST(req: Request) {
  const supabase = supabase();
  const body = await req.json();

  if (!body.partner_id || !body.amount) {
    return NextResponse.json({ error: "partner_id and amount are required" }, { status: 400 });
  }

  const { data, error } = await (await supabase)
    .from("partner_contributions")
    .insert([{ partner_id: body.partner_id, amount: body.amount }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}