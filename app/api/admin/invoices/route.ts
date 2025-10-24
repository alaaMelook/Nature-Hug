// app/api/admin/invoices/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";

// 📍 POST → Add Purchase Invoice
export async function POST(req: Request) {
  const supabase = supabase();
  const body = await req.json();

  const { data, error } = await (await supabase)
    .from("purchase_invoices")
    .insert([
      {
        supplier_id: body.supplier_id,
        invoice_no: body.invoice_no,
        date: body.date,
        total: body.total,
        attachment: body.attachment,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || { success: true }, { status: 201 });
}
