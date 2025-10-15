import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/supabase/server";

// GET all categories
export async function GET() {
  const supabase = await supabase();

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("Error fetching categories:", err);
    return NextResponse.json(
      { ok: false, error: (err as any).message },
      { status: 500 }
    );
  }
}

// POST create category
export async function POST(req: Request) {
  const body = await req.json();
  const supabase = await supabase();

  try {
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: body.name,
        description: body.description ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("Error creating category:", err);
    return NextResponse.json(
      { ok: false, error: (err as any).message },
      { status: 500 }
    );
  }
}
