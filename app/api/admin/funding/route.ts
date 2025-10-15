import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/supabase/server";

export async function GET() {
  const supabase = await supabase();

  const { data, error } = await supabase.from("funding_sources").select("*");
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  const supabase = await supabase();
  const body = await req.json();

  const { error } = await supabase.from("funding_sources").insert([
    {
      source_type: body.source_type,
      amount: body.amount,
      terms: body.terms,
    },
  ]);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
