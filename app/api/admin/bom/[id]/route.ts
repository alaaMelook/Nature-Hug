import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getSupabaseClient() {
  const maybeClient = createSupabaseServerClient();
  if (maybeClient && typeof (maybeClient as any).then === "function") {
    return await maybeClient;
  }
  return maybeClient;
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseClient();

    const { error } = await supabase
      .from("product_materials")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Supabase error (DELETE BOM):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Unexpected error (DELETE BOM):", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
