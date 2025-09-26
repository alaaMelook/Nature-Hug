import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from("expenses")
    .update(body)
    .eq("id", params.id)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data[0]);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("expenses").delete().eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
