import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // لازم السيرفر يستخدم Service Role
);

export async function GET(req: Request) {
  // 🟢 Get cart items
  const { searchParams } = new URL(req.url);
  const customer_uuid = searchParams.get("uuid");
  if (!customer_uuid) return NextResponse.json([]);

  const { data: cart } = await supabase
    .from("carts")
    .select("*")
    .eq("customer_uuid", customer_uuid)
    .single();

  if (!cart) return NextResponse.json([]);

  const { data: items } = await supabase
    .from("cart_items")
    .select("id, quantity, products(name_english, price)")
    .eq("cart_id", cart.id);

  return NextResponse.json(items ?? []);
}

export async function POST(req: Request) {
  // 🟢 Add to cart
  try {
    const { product_id, customer_uuid } = await req.json();

    let { data: cart } = await supabase
      .from("carts")
      .select("*")
      .eq("customer_uuid", customer_uuid)
      .single();

    if (!cart) {
      const { data: newCart } = await supabase
        .from("carts")
        .insert([{ customer_id: 0, customer_uuid }])
        .select()
        .single();
      cart = newCart;
    }

    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id)
      .eq("product_id", product_id)
      .single();

    if (existingItem) {
      await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("id", existingItem.id);
    } else {
      await supabase
        .from("cart_items")
        .insert([{ cart_id: cart.id, product_id, quantity: 1 }]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err });
  }
}

export async function PATCH(req: Request) {
  // 🟢 Update quantity
  try {
    const { item_id, quantity } = await req.json();

    await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", item_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err });
  }
}

export async function DELETE(req: Request) {
  // 🟢 Remove item from cart
  try {
    const { item_id } = await req.json();

    await supabase.from("cart_items").delete().eq("id", item_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err });
  }
}
