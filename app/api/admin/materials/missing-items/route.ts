// app/api/admin/materials/missing-items/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";

/* -----------------------------
   GET /api/admin/materials/missing-items
   → Get all missing items
------------------------------ */
export async function GET() {
  const supabase = await supabase();

  const { data, error } = await supabase
    .from("missing_items")
    .select(
      `
      id,
      name,
      type,
      quantity,
      price,
      supplier_id,
      suppliers(name),
      material_id,
      materials(name),
      notes,
      image_url,
      checked,
      purchased,
      created_at,
      updated_at
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching missing_items:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

/* -----------------------------
   POST /api/admin/materials/missing-items
   → Add new missing item
------------------------------ */
export async function POST(req: Request) {
  const supabase = await supabase();
  const body = await req.json();

  const { data, error } = await supabase
    .from("missing_items")
    .insert([
      {
        name: body.name,
        type: body.type ?? "raw",
        quantity: body.quantity ?? null,
        price: body.price ?? null,
        supplier_id: body.supplier_id ?? null,
        material_id: body.material_id ?? null,
        notes: body.notes ?? null,
        image_url: body.image_url ?? null,
        checked: body.checked ?? false,
        purchased: body.purchased ?? false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("❌ Error inserting missing_item:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

/* -----------------------------
   PUT /api/admin/materials/missing-items/:id
   → Update missing item
------------------------------ */
export async function PUT(req: Request) {
  const supabase = await supabase();
  const body = await req.json();
  const id = body.id;

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("missing_items")
    .update({
      name: body.name,
      type: body.type,
      quantity: body.quantity,
      price: body.price,
      supplier_id: body.supplier_id,
      material_id: body.material_id,
      notes: body.notes,
      image_url: body.image_url,
      checked: body.checked,
      purchased: body.purchased,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("❌ Error updating missing_item:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

/* -----------------------------
   DELETE /api/admin/materials/missing-items/:id
   → Delete missing item
------------------------------ */
export async function DELETE(req: Request) {
  const supabase = await supabase();
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  const { error } = await supabase.from("missing_items").delete().eq("id", id);

  if (error) {
    console.error("❌ Error deleting missing_item:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
