import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/supabase/server";

type LocalItem = { productId: string; quantity: number };

export async function POST(req: Request) {
  const supabase = await supabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { items } = (await req.json()) as { items: LocalItem[] };
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const productIds = items.map((i) => i.productId);

  const { data: existing, error: selErr } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("user_id", user.id)
    .in("product_id", productIds);

  if (selErr)
    return NextResponse.json({ error: selErr.message }, { status: 500 });

  const existingMap = new Map(
    existing?.map((e) => [String(e.product_id), e.quantity]) ?? []
  );

  const upserts = items.map((i) => ({
    user_id: user.id,
    product_id: i.productId,
    quantity:
      (existingMap.get(String(i.productId)) ?? 0) +
      Math.max(1, Number(i.quantity || 0)),
    updated_at: new Date().toISOString(),
  }));

  const { error: upErr } = await supabase
    .from("cart_items")
    .upsert(upserts, { onConflict: "user_id,product_id" });

  if (upErr)
    return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
