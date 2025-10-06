import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server"; // ✅ ده عندك بالفعل

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 🔹 نحدد اسم فريد للملف داخل الباكِت
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    // 🔹 نرفع الصورة إلى bucket اسمها invoices
    const { data, error } = await supabase.storage
      .from("invoices")
      .upload(fileName, file, { contentType: file.type });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 🔹 نجيب الرابط العام للصورة
    const { data: publicData } = supabase.storage
      .from("invoices")
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicData.publicUrl });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
