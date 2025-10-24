import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";

// 🟢 Get all units
export async function GET() {
  const supabase = await supabase();

  const { data, error } = await supabase
    .from("units")
    .select("id, name")
    .order("id", { ascending: true });

  if (error) {
    console.error("GET /units error:", error);
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// 🟢 Add new unit
export async function POST(req: Request) {
  const supabase = await supabase();
  const body = await req.json();
  const { name } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Unit name is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("units")
    .insert([{ name: name.trim() }])
    .select();

  if (error) {
    console.error("POST /units error:", error);
    return NextResponse.json({ error: "Failed to create unit" }, { status: 500 });
  }

  return NextResponse.json(data?.[0] || {});
}

// 🟡 Update existing unit
export async function PUT(req: Request) {
  const supabase = await supabase();
  const body = await req.json();
  const { id, name } = body;

  if (!id || !name || !name.trim()) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { error } = await supabase
    .from("units")
    .update({ name: name.trim() })
    .eq("id", id);

  if (error) {
    console.error("PUT /units error:", error);
    return NextResponse.json({ error: "Failed to update unit" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// 🔴 Delete unit
export async function DELETE(req: Request) {
  const supabase = await supabase();
  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing unit ID" }, { status: 400 });
  }

  // 👇 نحاول نحذف الوحدة
  const { error } = await supabase.from("units").delete().eq("id", id);

  // ⚠️ لو في خطأ بسبب foreign key (مواد مرتبطة بالوحدة)
  if (error && error.message.includes("foreign key")) {
    return NextResponse.json(
      { error: "Cannot delete unit — it’s used by existing materials" },
      { status: 400 }
    );
  }

  if (error) {
    console.error("DELETE /units error:", error);
    return NextResponse.json({ error: "Failed to delete unit" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
