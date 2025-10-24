import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";

// 📍 GET → كل الموردين + الفواتير بتاعتهم
export async function GET() {
  const supabase = supabase();

  const { data: suppliers, error: suppliersError } = await (await supabase)
    .from("suppliers")
    .select("id, name, phone, email, address, notes");

  if (suppliersError) {
    return NextResponse.json(
      { error: suppliersError.message },
      { status: 500 }
    );
  }

  const { data: invoices, error: invoicesError } = await (await supabase)
    .from("purchase_invoices")
    .select("id, invoice_no, supplier_id, date, total, attachment");

  if (invoicesError) {
    return NextResponse.json(
      { error: invoicesError.message },
      { status: 500 }
    );
  }

  const result =
    suppliers?.map((s) => ({
      ...s,
      invoices: invoices?.filter((inv) => inv.supplier_id === s.id) || [],
    })) || [];

  return NextResponse.json(result, { status: 200 });
}

// 📍 POST → إضافة مورد جديد
export async function POST(req: Request) {
  const supabase = supabase();
  const body = await req.json();

  const { data, error } = await (await supabase)
    .from("suppliers")
    .insert([
      {
        name: body.name,
        phone: body.phone,
        email: body.email,
        address: body.address,
        notes: body.notes,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // لو مفيش data راجعة → رجع success فاضي
  return NextResponse.json(data || { success: true }, { status: 201 });
}
