import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/supabase/server";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await supabase();
  const { id } = await context.params;
  const invoiceId = Number(id);

  const body = await req.json();

  // 1️⃣ حدّث بيانات الفاتورة الأساسية
  const { items, ...invoiceData } = body;
  const { error: invErr } = await supabase
    .from("purchase_invoices")
    .update(invoiceData)
    .eq("id", id);

  if (invErr) return Response.json({ error: invErr.message }, { status: 400 });

  // 2️⃣ احذف البنود القديمة
  await supabase.from("purchase_invoice_items").delete().eq("purchase_invoice_id", id);

  // 3️⃣ أضف البنود الجديدة
  if (Array.isArray(items) && items.length > 0) {
    const newItems = items.map((it: any) => ({
      purchase_invoice_id: id,
      material_id: it.material_id,
      quantity: it.quantity,
      price: it.price,
    }));
    const { error: itemErr } = await supabase
      .from("purchase_invoice_items")
      .insert(newItems);

    if (itemErr) return Response.json({ error: itemErr.message }, { status: 400 });
  }

  return Response.json({ success: true });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = Number(params.id);
  const supabase = await supabase();

  const { error } = await supabase
    .from("purchase_invoices")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
