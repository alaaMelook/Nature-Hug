// app/api/admin/bom/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // جلب كل الـ variant_materials مع المعلومات المرتبطة بالـ variant و material و product
    const { data, error } = await supabase
      .from("variant_materials")
      .select(`
        id,
        variant_id,
        grams_used,
        material:materials(id, name, price_per_gram),
        variant:product_variants(id, name, product_id, product:products(name_english))
      `);

    if (error) throw error;

    const formatted = (data || []).map((row: any) => ({
      id: row.id,
      variant_id: row.variant_id,
      variant_name: row.variant?.name ?? "",
      product_id: row.variant?.product_id ?? 0,
      product_name: row.variant?.product?.name_english ?? "",
      material_id: row.material_id,
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

// ✅ إضافة مادة جديدة للـ variant
export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();
    const { variant_id, material_id, grams_used } = body;

    if (!variant_id || !material_id || !grams_used) {
      return NextResponse.json(
        { success: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("variant_materials")
      .insert([{ variant_id, material_id, grams_used }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("BOM POST error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// ✅ تعديل الـ grams_used
export async function PUT(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
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

// ✅ حذف مادة من الـ variant
export async function DELETE(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("variant_materials")
      .delete()
      .eq("id", id);

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
