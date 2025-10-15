import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/supabase/server";

export async function GET(req: Request) {
  const supabase = await supabase();

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // 🟢 المواد الخام
  const { data: materials } = await supabase
    .from("materials")
    .select("id, name, stock_grams, price_per_gram, low_stock_threshold");

  // 🟢 المنتجات
  const { data: products } = await supabase
    .from("products")
    .select("id, name_english, stock, price");

  // 🟢 الحركات
  let query = supabase
    .from("movements")
    .select("type, material_id, product_id, quantity, date");

  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);

  const { data: movements } = await query;

  // 🔥 حساب الاستهلاك (لكل مادة)
  const consumption: Record<number, number> = {};
  movements
    ?.filter((m) => m.type === "out" && m.material_id)
    .forEach((m) => {
      consumption[m.material_id!] =
        (consumption[m.material_id!] || 0) + m.quantity;
    });

  // 🧱 قائمة المواد الخام + الاستهلاك
  const materialStocks =
    materials?.map((m) => ({
      id: m.id,
      name: m.name,
      stock_grams: m.stock_grams ?? 0,
      price_per_gram: m.price_per_gram ?? 0,
      totalValue: (m.stock_grams ?? 0) * (m.price_per_gram ?? 0),
      consumed: consumption[m.id] || 0,
      low_stock_threshold: m.low_stock_threshold ?? 0,
    })) ?? [];

  // 🧮 إجمالي قيمة المواد الخام
  const totalMaterialsValue =
    materialStocks.reduce((sum, m) => sum + m.totalValue, 0);

  // 🔴 المواد الخام القليلة
  const lowMaterials =
    materials?.filter((m) => m.stock_grams <= (m.low_stock_threshold ?? 0))
      .length ?? 0;

  // 🟡 المنتجات القليلة
  const lowProducts =
    products?.filter((p) => (p.stock ?? 0) <= 5).length ?? 0;

  // 🧾 المنتجات
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

  // 🏭 الأكثر إنتاجًا
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

  // ✅ النتيجة النهائية
  return NextResponse.json({
    totalMaterialsValue,
    lowMaterials,
    lowProducts,
    totalProductsValue,
    materialStocks, // ← فيها كمان consumed
    productStocks,
    topProduced,
    from: from || "beginning",
    to: to || "now",
  });
}
