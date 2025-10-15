import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/supabase/server";

export async function POST(req: Request) {
  const supabase = await supabase();
  const body = await req.json();
  const { period_start, period_end } = body;

  // 1. الإيرادات
  const { data: revenues, error: revError } = await supabase
    .from("orders")
    .select("total")
    .gte("created_at", period_start)
    .lte("created_at", period_end);

  if (revError) return NextResponse.json({ error: revError.message }, { status: 400 });
  const totalRevenue = (revenues ?? []).reduce(
    (sum, r) => sum + Number(r.total ?? 0),
    0
  );

  // 2. المصروفات
  const { data: overheads, error: overError } = await supabase
    .from("overheads")
    .select("amount");

  if (overError) return NextResponse.json({ error: overError.message }, { status: 400 });
  const totalOverheads = (overheads ?? []).reduce(
    (sum, o) => sum + Number(o.amount ?? 0),
    0
  );

  // 3. المشتريات
  const { data: purchases, error: purError } = await supabase
    .from("purchase_invoices")
    .select("total")
    .gte("date", period_start)
    .lte("date", period_end);

  if (purError) return NextResponse.json({ error: purError.message }, { status: 400 });
  const totalPurchases = (purchases ?? []).reduce(
    (sum, p) => sum + Number(p.total ?? 0),
    0
  );

  // 4. صافي الربح
  const netProfit = totalRevenue - (totalOverheads + totalPurchases);

  // 5. الشركاء
  const { data: partners, error: partnersError } = await supabase
    .from("partners")
    .select("*");

  if (partnersError) return NextResponse.json({ error: partnersError.message }, { status: 400 });

  // 6. توزيع الأرباح
  const distributions = (partners ?? []).map((p) => ({
    partner_id: p.id,
    period_start,
    period_end,
    profit_share: (netProfit * Number(p.ownership_percentage ?? 0)) / 100,
  }));

  // 7. تخزين التوزيعات
  const { data: saved, error: distError } = await supabase
    .from("partner_distributions")
    .insert(distributions)
    .select();

  if (distError) return NextResponse.json({ error: distError.message }, { status: 400 });

  return NextResponse.json({
    totalRevenue,
    totalOverheads,
    totalPurchases,
    netProfit,
    distributions: saved,
  });
}
