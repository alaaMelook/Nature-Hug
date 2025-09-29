import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ✅ GET: يرجع Snapshot من الـ Inventory
export async function GET() {
  const supabase = await createSupabaseServerClient();

  // نجيب المواد + المورد + الكاتيجوري
  const { data, error } = await supabase
    .from("materials")
    .select("id, name, stock_grams, price_per_gram, low_stock_threshold, supplier:suppliers(id, name), category:categories(id, name_english)");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // نضيف قيمة إجمالي stock + status
  const rows = (data || []).map((m) => ({
    ...m,
    total_value: Number(m.stock_grams) * Number(m.price_per_gram),
    status:
      m.low_stock_threshold && m.stock_grams < m.low_stock_threshold
        ? "Low"
        : "OK",
  }));

  return NextResponse.json(rows);
}

// ✅ POST: إضافة حركة جديدة للمخزون (IN/OUT/ADJUST)
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();

  const { material_id, type, quantity, note, user_id } = body;

  if (!material_id || !type || !quantity) {
    return NextResponse.json(
      { error: "material_id, type, and quantity are required" },
      { status: 400 }
    );
  }

  // 1) نسجل الحركة في movements
  const { error: moveError } = await supabase.from("movements").insert([
    {
      material_id,
      type, // IN / OUT / ADJUST
      quantity,
      user_id,
      note,
    },
  ]);

  if (moveError) {
    return NextResponse.json({ error: moveError.message }, { status: 500 });
  }

  // 2) نعدل كمية الـ stock_grams في materials
  let operator = type === "OUT" ? -1 : 1;
  if (type === "ADJUST") operator = 0; // ADJUST بيكون تعديل مباشر

  if (operator !== 0) {
    const { error: stockError } = await supabase.rpc("update_material_stock", {
      mat_id: material_id,
      qty_change: operator * quantity,
    });

    if (stockError) {
      return NextResponse.json({ error: stockError.message }, { status: 500 });
    }
  } else {
    // تعديل مباشر → overwrite الكمية
    const { error: adjustError } = await supabase
      .from("materials")
      .update({ stock_grams: quantity })
      .eq("id", material_id);

    if (adjustError) {
      return NextResponse.json({ error: adjustError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
