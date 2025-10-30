import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    console.log("[Supabase] Inserting new customer.");
    const { name, address, phone, email } = await req.json();

    const { data: customer, error } = await supabase
      .from("customers")
      .insert([{ name, address, phone, email }])
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Error inserting customer:", error);
      throw error;
    }

    console.log("[Supabase] Customer inserted successfully:", customer);

    return NextResponse.json({ success: true, customer });
  } catch (err) {
    console.error("[Supabase] Error in POST handler:", err);
    return NextResponse.json({ success: false, error: err });
  }
}
