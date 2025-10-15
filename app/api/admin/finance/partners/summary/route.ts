import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/supabase/server";

export async function GET(req: Request) {
  const supabase = await supabase();
  const { searchParams } = new URL(req.url);
  const partnerId = searchParams.get("partner_id");

  // 1. لو في partner_id → شريك واحد
  if (partnerId) {
    const { data: partner, error } = await supabase
      .from("partners")
      .select("*")
      .eq("id", partnerId)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // مساهماته
    const { data: contributions } = await supabase
      .from("funding_sources")
      .select("amount")
      .eq("source_type", "partner")
      .eq("terms", partnerId);

    const totalContributions = (contributions ?? []).reduce(
      (sum, c) => sum + Number(c.amount ?? 0),
      0
    );

    // توزيعات أرباحه
    const { data: distributions } = await supabase
      .from("partner_distributions")
      .select("profit_share")
      .eq("partner_id", partnerId);

    const totalProfitShare = (distributions ?? []).reduce(
      (sum, d) => sum + Number(d.profit_share ?? 0),
      0
    );

    return NextResponse.json({
      ...partner,
      totalContributions,
      totalProfitShare,
      netPosition: totalProfitShare - totalContributions,
    });
  }

  // 2. لو مفيش partner_id → كل الشركاء
  const { data: partners, error } = await supabase.from("partners").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const results = [];

  for (const p of partners) {
    const { data: contributions } = await supabase
      .from("funding_sources")
      .select("amount")
      .eq("source_type", "partner")
      .eq("terms", p.id);

    const totalContributions = (contributions ?? []).reduce(
      (sum, c) => sum + Number(c.amount ?? 0),
      0
    );

    const { data: distributions } = await supabase
      .from("partner_distributions")
      .select("profit_share")
      .eq("partner_id", p.id);

    const totalProfitShare = (distributions ?? []).reduce(
      (sum, d) => sum + Number(d.profit_share ?? 0),
      0
    );

    results.push({
      ...p,
      totalContributions,
      totalProfitShare,
      netPosition: totalProfitShare - totalContributions,
    });
  }

  return NextResponse.json(results);
}
