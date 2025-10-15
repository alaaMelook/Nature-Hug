import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/supabase/server";

export async function GET() {
  const supabase = await supabase();
  const { data, error } = await supabase
    .from("expenses")
    .select("*, partners(name)")
    .order("date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await supabase();
  const body = await req.json();

  if (!body.type || !body.item_name || !body.amount) {
    return NextResponse.json({ error: "⚠️ لازم تدخل النوع، الاسم، المبلغ" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert([{
      type: body.type,
      item_name: body.item_name,
      amount: body.amount,
      currency: body.currency || "EGP",
      status: body.status || "paid",
      description: body.description || null,
      paid_by_partner_id: body.paid_by_partner_id || null,
      attachment: body.attachment || null,
      linked_order_id: body.linked_order_id || null
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
