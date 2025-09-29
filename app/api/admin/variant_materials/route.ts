import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: vmData, error: vmError } = await supabase
      .from("variant_materials")
      .select("*");
    if (vmError) throw vmError;

    const { data: variantsData, error: varError } = await supabase
      .from("product_variants")
      .select("*");
    if (varError) throw varError;

    const { data: productsData, error: prodError } = await supabase
      .from("products")
      .select("*");
    if (prodError) throw prodError;

    const { data: materialsData, error: matError } = await supabase
      .from("materials")
      .select("*");
    if (matError) throw matError;

    const matMap = new Map(materialsData.map((m) => [m.id, m]));
    const varMap = new Map(variantsData.map((v) => [v.id, v]));
    const prodMap = new Map(productsData.map((p) => [p.id, p]));

    const result = vmData.map((vm) => {
      const mat = matMap.get(vm.material_id);
      const variant = varMap.get(vm.variant_id);
      const product = variant ? prodMap.get(variant.product_id) : null;
      const unit_cost = mat?.price_per_gram ?? 0;
      const grams_used = vm.grams_used ?? 0;
      return {
        ...vm,
        material_name: mat?.name ?? "",
        unit_cost,
        total_cost: unit_cost * grams_used,
        variant_name: variant?.name ?? "",
        product_id: product?.id ?? 0,
        product_name: product?.name_english ?? "",
      };
    });

    return NextResponse.json({ data: result });
  } catch (err: any) {
    console.error("variant_materials GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();
    const { variant_id, material_id, grams_used } = body;

    if (!variant_id || !material_id || !grams_used) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("variant_materials")
      .insert([{ variant_id, material_id, grams_used }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      data: {
        id: data.id,
        variant_id: data.variant_id,
        material_id: data.material_id,
        material_name: (await supabase.from("materials").select("name, price_per_gram").eq("id", material_id).single()).data?.name ?? "",
        grams_used: data.grams_used,
        unit_cost: (await supabase.from("materials").select("price_per_gram").eq("id", material_id).single()).data?.price_per_gram ?? 0,
        total_cost: data.grams_used * ((await supabase.from("materials").select("price_per_gram").eq("id", material_id).single()).data?.price_per_gram ?? 0),
      },
    });
  } catch (err: any) {
    console.error("variant_materials POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();
    const { id, grams_used } = body;

    if (!id || grams_used == null) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("variant_materials")
      .update({ grams_used })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("variant_materials PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
