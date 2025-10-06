// app/api/admin/purchase_invoices/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const { data, error } = await supabase
      .from("purchase_invoices")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { error } = await supabase.from("purchase_invoices").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
