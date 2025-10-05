// app/api/admin/bom/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SupaRow = any;

function getSafeClient() {
  const maybe = createSupabaseServerClient();
  if (maybe && typeof (maybe as any).then === "function") {
    return (maybe as any).then((c: any) => c);
  }
  return Promise.resolve(maybe);
}

function mapRows(items: any[]): SupaRow[] {
  return items.map((item, idx) => {
    const prod = Array.isArray(item.products) ? item.products[0] : item.products;
    const mat = Array.isArray(item.materials) ? item.materials[0] : item.materials;
    const productId = prod?.id ?? item.product_id ?? null;
    const materialId = mat?.id ?? item.material_id ?? null;
    const id =
      item.id ??
      (productId !== null && materialId !== null
        ? `${productId}-${materialId}`
        : `bom-${idx}`);
    const grams = Number(item.grams_used ?? 0);
    const pricePerGram = Number(mat?.price_per_gram ?? 0);
    return {
      id,
      product_id: productId,
      product_name: prod?.name_english ?? "",
      material_id: materialId,
      material_name: mat?.name ?? "",
      grams_used: grams,
      unit_cost: pricePerGram,
      total_cost: grams * pricePerGram,
    };
  });
}

//
// GET
//
export async function GET() {
  try {
    const supabase = await getSafeClient();
    const { data, error } = await supabase
      .from("product_materials")
      .select(`
        id,
        grams_used,
        product_id,
        material_id,
        products ( id, name_english ),
        materials ( id, name, price_per_gram )
      `);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data: mapRows(data || []) });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}

//
// POST
//
export async function POST(req: Request) {
  try {
    const supabase = await getSafeClient();
    const body = await req.json();

    const product_id = body.product_id ?? null;
    const items = Array.isArray(body.items) ? body.items : null;

    let insertData: any[] = [];
    if (items && product_id) {
      insertData = items.map((it: any) => ({
        product_id,
        material_id: it.materialId,
        grams_used: it.grams,
      }));
    } else if (product_id && body.material_id && body.grams_used != null) {
      insertData = [
        {
          product_id,
          material_id: body.material_id,
          grams_used: body.grams_used,
        },
      ];
    } else {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("product_materials")
      .insert(insertData)
      .select(`
        id,
        grams_used,
        product_id,
        material_id,
        products ( id, name_english ),
        materials ( id, name, price_per_gram )
      `);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data: mapRows(data || []) });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}

//
// PUT
//
export async function PUT(req: Request) {
  try {
    const supabase = await getSafeClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const body = await req.json();

    const { data, error } = await supabase
      .from("product_materials")
      .update({ grams_used: body.grams_used })
      .eq("id", id)
      .select(`
        id,
        grams_used,
        product_id,
        material_id,
        products ( id, name_english ),
        materials ( id, name, price_per_gram )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data: mapRows([data])[0] });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}

//
// DELETE
//
export async function DELETE(req: Request) {
  try {
    const supabase = await getSafeClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("product_materials")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}