// app/api/admin/purchase_invoices/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🟩 GET ALL PURCHASE INVOICES
export async function GET() {
  const { data, error } = await supabase
  .from("purchase_invoices")
  .select(`
    id,
    invoice_no,
    supplier_id,
    date,
    total,
    note,
    extra_expenses,
    purchase_invoice_items (
      material_id,
      quantity,
      price
    )
  `)

    .order("id", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// 🟦 CREATE NEW INVOICE
export async function POST(req: Request) {
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

    if (!supplier_id || !invoice_no)
      return NextResponse.json({ error: "Missing supplier or invoice_no" }, { status: 400 });

    // 1️⃣ أضف الفاتورة
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

    // 2️⃣ أضف البنود (items)
    if (items && items.length) {
      const itemsToInsert = items.map((it: any) => ({
        invoice_id: invoice.id,
        material_id: it.material_id,
        quantity: it.quantity,
        price: it.price,
      }));

      const { error: itemsErr } = await supabase
        .from("purchase_invoice_items")
        .insert(itemsToInsert);

      if (itemsErr) throw itemsErr;

      // 3️⃣ تحديث المخزون والسعر المتوسط لكل مادة
      for (const it of items) {
        if (!it.material_id) continue;

        const { data: matData } = await supabase
          .from("materials")
          .select("stock_grams, price_per_gram")
          .eq("id", it.material_id)
          .single();

        if (matData) {
          const oldStock = matData.stock_grams || 0;
          const newStock = oldStock + Number(it.quantity);

          const oldPrice = matData.price_per_gram || 0;
          const newPricePerGram = it.quantity
            ? it.price / it.quantity
            : oldPrice;

          await supabase
            .from("materials")
            .update({
              stock_grams: newStock,
              price_per_gram: newPricePerGram,
            })
            .eq("id", it.material_id);
        }
      }
    }

    return NextResponse.json(invoice);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
