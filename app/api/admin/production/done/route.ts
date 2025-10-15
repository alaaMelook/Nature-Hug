import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/supabase/server";

export async function POST(req: Request) {
  const { productId, qty } = await req.json();
  const supabase = await supabase();

  // جيب المنتج مع خاماته
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id, name_english, stock,
      product_materials (
        grams_used,
        materials ( id, name, stock_grams )
      )
    `)
    .eq("id", productId)
    .single();

  if (error || !product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  // المواد المطلوبة
  const requirements = product.product_materials.map((pm: any) => ({
    materialId: pm.materials.id,
    name: pm.materials.name,
    needQty: pm.grams_used * qty,
    available: pm.materials.stock_grams,
  }));

  // تحقق من النواقص
  const shortage = requirements.filter(r => r.needQty > r.available);
  if (shortage.length > 0) {
    return NextResponse.json(
      { error: "INSUFFICIENT_MATERIALS", shortage },
      { status: 400 }
    );
  }

  // خصم المواد
  for (const r of requirements) {
    await supabase
      .from("materials")
      .update({ stock_grams: r.available - r.needQty })
      .eq("id", r.materialId);
  }

  // تحديث رصيد المنتج
  await supabase
    .from("products")
    .update({ stock: (product.stock || 0) + qty })
    .eq("id", productId);

  return NextResponse.json({ ok: true, message: "Production completed" });
}
