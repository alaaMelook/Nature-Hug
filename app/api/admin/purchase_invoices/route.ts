import { NextResponse } from "next/server";
// 📁 app/api/admin/purchase_invoices/route.ts
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  // 👇 بنجيب كل الفواتير ومعاها الأصناف المرتبطة من جدول items
  const { data, error } = await supabase
    .from("purchase_invoices")
    .select(`
      id,
      invoice_no,
      supplier_id,
      date,
      total,
      note,
      attachments,
      extra_expenses,
      purchase_invoice_items (
        id,
        purchase_invoice_id,
        material_id,
        quantity,
        price
      )
    `)
    .order("id", { ascending: false });

  if (error) {
    console.error("❌ Error fetching purchase_invoices:", error);
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json(data);
}


export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  try {
    const body = await req.json();
    const {
      supplier_id,
      invoice_no,
      date,
      total,
      attachments,
      note,
      extra_expenses,
      items,
    } = body;

    if (!supplier_id || !invoice_no) {
      return NextResponse.json(
        { error: "Missing supplier_id or invoice_no" },
        { status: 400 }
      );
    }

    // 1️⃣ أضف الفاتورة الأساسية
    const { data: invoice, error: invErr } = await supabase
      .from("purchase_invoices")
      .insert([
        {
          supplier_id,
          invoice_no,
          date,
          total,
          attachments,
          note,
          extra_expenses,
        },
      ])
      .select()
      .single();

    if (invErr) throw invErr;

    // 2️⃣ أضف البنود الخاصة بالفاتورة
    if (items && items.length > 0) {
      const itemsToInsert = items.map((it: any) => ({
        purchase_invoice_id: invoice.id, // ✅ المفتاح الخارجي الصحيح
        material_id: it.material_id,
        quantity: it.quantity,
        price: it.price,
      }));

      const { error: itemsErr } = await supabase
        .from("purchase_invoice_items")
        .insert(itemsToInsert);

      if (itemsErr) throw itemsErr;
    }

    return NextResponse.json(invoice);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
