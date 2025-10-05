import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ✅ Get all units
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("GET /units error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ✅ Create new unit
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { name } = await req.json();

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Unit name is required" }, { status: 400 });
  }

  // prevent duplicates
  const { data: existing } = await supabase.from("units").select("*").eq("name", name.trim());
  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "Unit already exists" }, { status: 400 });
  }

  const { data, error } = await supabase.from("units").insert([{ name: name.trim() }]).select().single();

  if (error) {
    console.error("POST /units error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// ✅ Update unit
export async function PUT(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { id, name } = await req.json();

  if (!id || !name || !name.trim()) {
    return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
  }

  const { error } = await supabase.from("units").update({ name: name.trim() }).eq("id", id);

  if (error) {
    console.error("PUT /units error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// ✅ Delete unit
export async function DELETE(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const { error } = await supabase.from("units").delete().eq("id", id);

  if (error) {
    console.error("DELETE /units error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
