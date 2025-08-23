import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { name, address, phone, email, governorate } = await req.json();

    // إضافة عميل جديد
    const { data: customer, error } = await supabase
      .from("customers")
      .insert([{ name, address, phone, email }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, customer });
  } catch (err) {
    return NextResponse.json({ success: false, error: err });
  }
}
