// app/api/admin/cost/[id]/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// 🔹 Get one overhead by ID
export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("overheads")
      .select("*")
      .eq("id", Number(id))
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("Error fetching overhead:", err);
    return NextResponse.json(
      { ok: false, error: (err as any).message },
      { status: 500 }
    );
  }
}

// 🔹 Update overhead
export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const body = await req.json();
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("overheads")
      .update({
        name: body.name,
        amount: body.amount,
        depreciation_rate: body.depreciation_rate,
        category_id: body.category_id,
      })
      .eq("id", Number(id))
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("Error updating overhead:", err);
    return NextResponse.json(
      { ok: false, error: (err as any).message },
      { status: 500 }
    );
  }
}

// 🔹 Delete overhead
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase
      .from("overheads")
      .delete()
      .eq("id", Number(id));

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error deleting overhead:", err);
    return NextResponse.json(
      { ok: false, error: (err as any).message },
      { status: 500 }
    );
  }
}
