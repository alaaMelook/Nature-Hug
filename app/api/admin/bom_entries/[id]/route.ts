// app/api/admin/bom/[id]/route.ts   ------> draft
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getSupabaseClient() {
  const maybeClient = createSupabaseServerClient();
  if (maybeClient && typeof (maybeClient as any).then === "function") {
    return await maybeClient;
  }
  return maybeClient;
}

// ✅ Get BOM of a specific variant
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
      .from("variant_materials")
      .select(`
        id,
        grams_used,
        material:materials(id, name, price_per_gram),
        variant:product_variants(id, name, product_id, product:products(id, name_english))
      `)
      .eq("variant_id", params.id);

    if (error) throw error;

    const formatted = (data || []).map((row: any) => ({
      id: row.id,
      variant_id: row.variant?.id ?? 0,
      variant_name: row.variant?.name ?? "",
      product_id: row.variant?.product?.id ?? 0,
      product_name: row.variant?.product?.name_english ?? "",
      material_id: row.material?.id ?? 0,
      material_name: row.material?.name ?? "",
      grams_used: row.grams_used,
      unit_cost: row.material?.price_per_gram ?? 0,
      total_cost: row.grams_used * (row.material?.price_per_gram ?? 0),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: any) {
    console.error("BOM GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// ✅ Update grams_used for a material in BOM
export async function PUT(req: Request) {
  try {
    const supabase = await getSupabaseClient();
    const body = await req.json();
    const { id, grams_used } = body;

    if (!id || grams_used == null) {
      return NextResponse.json(
        { success: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("variant_materials")
      .update({ grams_used })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("BOM PUT error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// ✅ Delete a material from BOM
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseClient();

    const { error } = await supabase
      .from("variant_materials")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("BOM DELETE error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
