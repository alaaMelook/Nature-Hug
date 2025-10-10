import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const language = searchParams.get("lang") || "en";

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "active") // ✅ هنا الإضافة
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formatted = (data || []).map((p: any) => ({
      ...p,
      name: language === "en" ? p.name_english : p.name_arabic,
      description:
        language === "en" ? p.description_english : p.description_arabic,
      id: Number(p.id),
      price: Number(p.price) || 0,
      discount: p.discount != null ? Number(p.discount) : null,
      quantity: p.quantity != null ? Number(p.quantity) : null,
    }));

    return NextResponse.json({ success: true, products: formatted });
  } catch (err: any) {
    console.error("Error fetching products:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}