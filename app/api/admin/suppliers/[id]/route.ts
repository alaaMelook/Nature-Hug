import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/supabase/server";

export async function PUT(request: Request, context: { params: { id: string } }) {
  const id = context.params.id;
  const body = await request.json();
  const supabase = await supabase(); // لو الدالة async
  // const supabase = supabase(); // لو الدالة sync

  const { data, error } = await supabase
    .from("suppliers")
    .update({
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      notes: body.notes,
    })
    .eq("id", Number(id))
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const id = context.params.id;
  const supabase = await supabase(); // لو الدالة async
  // const supabase = supabase(); // لو الدالة sync

  const { error } = await supabase
    .from("suppliers")
    .delete()
    .eq("id", Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Supplier deleted" });
}