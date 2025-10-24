import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";

// GET one category
export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const supabase = await supabase();

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", Number(id))
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("Error fetching category:", err);
    return NextResponse.json(
      { ok: false, error: (err as any).message },
      { status: 500 }
    );
  }
}

// PATCH update category
export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const body = await req.json();
  const supabase = await supabase();

  try {
    const { data, error } = await supabase
      .from("categories")
      .update({
        name: body.name,
        description: body.description ?? null,
      })
      .eq("id", Number(id))
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("Error updating category:", err);
    return NextResponse.json(
      { ok: false, error: (err as any).message },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const supabase = await supabase();

  try {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", Number(id));

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error deleting category:", err);
    return NextResponse.json(
      { ok: false, error: (err as any).message },
      { status: 500 }
    );
  }
}
