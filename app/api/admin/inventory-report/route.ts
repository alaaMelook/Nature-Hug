import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from"); // ex: 2025-01-01
  const to = searchParams.get("to");     // ex: 2025-09-01

  // 🟢 المواد
  const { data: materials } = await supabase
    .from("materials")
    .select("id, name, stock_grams, price_per_gram, low_stock_threshold");

  // 🟢 المنتجات
  const { data: products } = await supabase
    .from("products")
    .select("id, name_english, stock, price");

  // 🟢 الحركات (مع الفلترة بالوقت لو موجودة)
  let query = supabase.from("movements").select("type, material_id, product_id, quantity, date");

  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);

  const { data: movements } = await query;

  // 🟢 إجمالي قيمة الخامات
  const totalMaterialsValue =
    materials?.reduce(
      (sum, m) => sum + m.stock_grams * m.price_per_gram,
      0
    ) ?? 0;

  // 🟢 المواد الـ Low
  const lowMaterials =
    materials?.filter((m) => m.stock_grams <= m.low_stock_threshold).length ?? 0;

  // 🟢 المنتجات الـ Low
  const lowProducts =
    products?.filter((p) => (p.stock ?? 0) <= 5).length ?? 0;

  // 🟢 قيمة كل منتج
  const productStocks =
    products?.map((p) => ({
      id: p.id,
      name: p.name_english,
      stock: p.stock ?? 0,
      price: p.price ?? 0,
      totalValue: (p.stock ?? 0) * (p.price ?? 0),
    })) ?? [];

  const totalProductsValue =
    productStocks.reduce((sum, p) => sum + p.totalValue, 0);

  // 🟢 الأكثر استهلاكًا
  const consumption: Record<number, number> = {};
  movements
    ?.filter((m) => m.type === "out" && m.material_id)
    .forEach((m) => {
      consumption[m.material_id!] =
        (consumption[m.material_id!] || 0) + m.quantity;
    });

  const topConsumed =
    materials
      ?.map((m) => ({
        id: m.id,
        name: m.name,
        totalConsumed: consumption[m.id] || 0,
      }))
      .sort((a, b) => b.totalConsumed - a.totalConsumed)
      .slice(0, 5) ?? [];

  // 🟢 الأكثر إنتاجًا
  const production: Record<number, number> = {};
  movements
    ?.filter((m) => m.type === "in" && m.product_id)
    .forEach((m) => {
      production[m.product_id!] =
        (production[m.product_id!] || 0) + m.quantity;
    });

  const topProduced =
    products
      ?.map((p) => ({
        id: p.id,
        name: p.name_english,
        totalProduced: production[p.id] || 0,
      }))
      .sort((a, b) => b.totalProduced - a.totalProduced)
      .slice(0, 5) ?? [];

  return NextResponse.json({
    totalMaterialsValue,
    lowMaterials,
    lowProducts,
    totalProductsValue,
    topConsumed,
    topProduced,
    productStocks,
    from: from || "beginning",
    to: to || "now",
  });
}
