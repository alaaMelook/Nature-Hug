import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/supabase/server";

export async function POST(req: Request) {
  try {
    const { productId, qty } = await req.json();

    if (!productId || !qty) {
      return NextResponse.json(
        { error: "Missing productId or qty" },
        { status: 400 }
      );
    }

    const supabase = await supabase();

    // Get product with its BOM
    const { data: product, error: productErr } = await supabase
      .from("products")
      .select(
        `
        id, name_english, stock,
        product_materials (
          grams_used,
          materials ( id, name, stock_grams, price_per_gram )
        )
      `
      )
      .eq("id", productId)
      .single();

    if (productErr || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Calculate required materials
    const requirements = product.product_materials.map((pm: any) => {
      const needQty = pm.grams_used * qty;
      return {
        materialId: pm.materials.id,
        name: pm.materials.name,
        needQty,
        available: pm.materials.stock_grams,
        unitPrice: pm.materials.price_per_gram,
      };
    });

    return NextResponse.json({ ok: true, requirements });
  } catch (err: any) {
    console.error("Production API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
