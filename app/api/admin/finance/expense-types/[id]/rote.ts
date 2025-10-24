import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";

export async function GET() {
  const supabase = await supabase();
  const { data, error } = await supabase.from("expense_types").select("*").order("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await supabase();
  const body = await req.json();

  const { data, error } = await supabase
    .from("expense_types")
    .insert([{ name: body.name, depreciation_rate: body.depreciation_rate }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
