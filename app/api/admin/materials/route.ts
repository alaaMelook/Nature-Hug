import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/supabase/server";

// ✅ GET all materials
export async function GET() {
  const supabase = await supabase();

  const { data, error } = await supabase
    .from("materials")
    .select(`
      *,
      supplier:suppliers(id, name),
      unit:units(id, name),
      material_products(
        product:products(id, name_english, name_arabic)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /materials error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ✅ POST (create new material)
export async function POST(req: Request) {
  const supabase = await supabase();
  const body = await req.json();

  // ممكن يكون Array أو Object واحد (من Excel أو من Form)
  const materials = Array.isArray(body) ? body : [body];
  const created: any[] = [];

  for (const material of materials) {
    const { products, ...rest } = material;

    const { data: matData, error: matError } = await supabase
      .from("materials")
      .insert([rest])
      .select()
      .single();

    if (matError) {
      console.error("POST /materials error:", matError);
      return NextResponse.json({ error: matError.message }, { status: 500 });
    }

    // ✅ Link products
    if (products && products.length > 0) {
      const rows = products.map((pId: number) => ({
        material_id: matData.id,
        product_id: pId,
      }));

      const { error: linkError } = await supabase
        .from("material_products")
        .insert(rows);

      if (linkError) {
        console.error("POST link products error:", linkError);
        return NextResponse.json({ error: linkError.message }, { status: 500 });
      }
    }

    created.push(matData);
  }

  return NextResponse.json(created, { status: 201 });
}

// ✅ PUT (update material)
export async function PUT(req: Request) {
  const supabase = await supabase();
  const { id, products, ...rest } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  // Update material itself (including unit_id)
  const { error: updateError } = await supabase
    .from("materials")
    .update(rest)
    .eq("id", id);

  if (updateError) {
    console.error("PUT /materials error:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Delete old product links
  await supabase.from("material_products").delete().eq("material_id", id);

  // Insert new ones
  if (products && products.length > 0) {
    const rows = products.map((pId: number) => ({
      material_id: id,
      product_id: pId,
    }));

    const { error: linkError } = await supabase
      .from("material_products")
      .insert(rows);

    if (linkError) {
      console.error("PUT link products error:", linkError);
      return NextResponse.json({ error: linkError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

// ✅ DELETE (delete material)
export async function DELETE(req: Request) {
  const supabase = await supabase();
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  // Delete product links first
  await supabase.from("material_products").delete().eq("material_id", id);

  // Delete material itself
  const { error } = await supabase.from("materials").delete().eq("id", id);

  if (error) {
    console.error("DELETE /materials error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
