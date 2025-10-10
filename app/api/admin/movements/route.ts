import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  // أولاً نجيب كل الحركات
  const { data: movements, error } = await supabase
    .from("movements")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("❌ Movements fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!movements || movements.length === 0) {
    return NextResponse.json([]);
  }

  // نجمع كل الـ IDs الخاصة بـ materials و products و users و documents
  const materialIds = movements.map((m) => m.material_id).filter(Boolean);
  const productIds = movements.map((m) => m.product_id).filter(Boolean);
  const userIds = movements.map((m) => m.user_id).filter(Boolean);
  const documentIds = movements.map((m) => m.document_id).filter(Boolean);

  // نجيبهم كلهم في queries منفصلة (batch)
  const [materialsRes, productsRes, usersRes, invoicesRes, ordersRes] = await Promise.all([
    supabase.from("materials").select("id, name").in("id", materialIds),
    supabase.from("products").select("id, name_english, name_arabic").in("id", productIds),
    supabase.from("customers").select("id, name").in("id", userIds),
    supabase.from("purchase_invoices").select("id, invoice_no").in("id", documentIds),
    supabase.from("orders").select("id").in("id", documentIds),
  ]);

  const materials = materialsRes.data || [];
  const products = productsRes.data || [];
  const users = usersRes.data || [];
  const invoices = invoicesRes.data || [];
  const orders = ordersRes.data || [];

  // ندمج كل حاجة مع بعض
  const enriched = movements.map((m) => {
    const material = materials.find((x) => x.id === m.material_id) || null;
    const product = products.find((x) => x.id === m.product_id) || null;
    const user = users.find((x) => x.id === m.user_id) || null;

    const invoice = invoices.find((x) => x.id === m.document_id);
    const order = orders.find((x) => x.id === m.document_id);

    let document_type: string | null = null;
    let document_ref: string | null = null;

    if (invoice) {
      document_type = "purchase_invoice";
      document_ref = invoice.invoice_no;
    } else if (order) {
      document_type = "order";
      document_ref = `#${order.id}`;
    }

    return {
      ...m,
      material,
      product,
      user,
      document_type,
      document_ref,
    };
  });

  return NextResponse.json(enriched);
}
