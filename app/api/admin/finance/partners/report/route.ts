import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";

export async function GET(req: Request) {
  const supabase = await supabase();
  const { searchParams } = new URL(req.url);
  const partnerId = searchParams.get("partner_id");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!partnerId) {
    return NextResponse.json({ error: "partner_id is required" }, { status: 400 });
  }

  // 1. بيانات الشريك
  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .select("*")
    .eq("id", partnerId)
    .single();

  if (partnerError) return NextResponse.json({ error: partnerError.message }, { status: 400 });

  // 2. مساهماته
  let contribQuery = supabase
    .from("funding_sources")
    .select("id, amount, created_at, terms")
    .eq("source_type", "partner")
    .eq("terms", partnerId);

  if (start) contribQuery = contribQuery.gte("created_at", start);
  if (end) contribQuery = contribQuery.lte("created_at", end);

  const { data: contributions, error: contribError } = await contribQuery;
  if (contribError) return NextResponse.json({ error: contribError.message }, { status: 400 });

  const totalContributions = (contributions ?? []).reduce(
    (sum, c) => sum + Number(c.amount ?? 0),
    0
  );

  // 3. توزيعات الأرباح
  let distQuery = supabase
    .from("partner_distributions")
    .select("id, profit_share, period_start, period_end, created_at")
    .eq("partner_id", partnerId);

  if (start) distQuery = distQuery.gte("created_at", start);
  if (end) distQuery = distQuery.lte("created_at", end);

  const { data: distributions, error: distError } = await distQuery;
  if (distError) return NextResponse.json({ error: distError.message }, { status: 400 });

  const totalProfitShare = (distributions ?? []).reduce(
    (sum, d) => sum + Number(d.profit_share ?? 0),
    0
  );

  // 4. صافي الوضع
  const netPosition = totalProfitShare - totalContributions;

  return NextResponse.json({
    partner,
    totalContributions,
    contributions,
    totalProfitShare,
    distributions,
    netPosition,
  });
}
