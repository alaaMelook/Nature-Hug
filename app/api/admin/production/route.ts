import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { productId, qty, performedBy } = body;
const supabase = await createSupabaseServerClient();

  // 1. جيب المنتج مع خاماته
  const { data: product, error: productErr } = await supabase
    .from("products")
    .select(`
      id, name_english, stock,
      product_materials (
        grams_used,
        materials ( id, name, stock_grams, price_per_gram )
      )
    `)
    .eq("id", productId)
    .single();

  if (productErr || !product) {
    return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
  }

  // 2. احسبي الخامات المطلوبة
  const required = product.product_materials.map((pm: any) => {
    const needQty = pm.grams_used * qty;
    return {
      materialId: pm.materials.id,
      name: pm.materials.name,
      needQty,
      available: pm.materials.stock_grams,
      unitPrice: pm.materials.price_per_gram
    };
  });

  // 3. تحقق من النواقص
  const shortage = required.filter(r => r.needQty > r.available);
  if (shortage.length > 0) {
    return NextResponse.json({ ok: false, error: "INSUFFICIENT_MATERIALS", details: shortage }, { status: 400 });
  }

  // 4. نفذي التحديثات (⚠️ لازم Transaction - Supabase لسه ما بتدعمش Transactions رسمي، الحل إما:
  //    - نكتب SQL Function في Supabase
  //    - أو نعمل التحديثات واحدة واحدة بحرص)
  for (const r of required) {
    await supabase.rpc("decrement_material_stock", { material_id: r.materialId, used_qty: r.needQty });

    await supabase.from("movements").insert({
      type: "PRODUCTION",
      material_id: r.materialId,
      quantity: -r.needQty,
      note: `Consumed for ${qty} of ${product.name_english}`,
      user_id: performedBy
    });
  }

  // زودي المنتج النهائي
  await supabase.from("products").update({ stock: product.stock + qty }).eq("id", productId);

  await supabase.from("movements").insert({
    type: "PRODUCTION",
    product_id: productId,
    quantity: qty,
    note: `Produced ${qty} of ${product.name_english}`,
    user_id: performedBy
  });

  return NextResponse.json({ ok: true, message: "Production completed" });
}
