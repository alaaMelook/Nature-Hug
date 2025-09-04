import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getOrCreateCart(customer_uuid: string) {
  let { data: cart } = await supabase
    .from("carts")
    .select("*")
    .eq("customer_uuid", customer_uuid)
    .single();

  if (!cart) {
    const { data: newCart, error } = await supabase
      .from("carts")
      .insert([{ customer_uuid }])
      .select()
      .single();

    if (error) throw error;
    cart = newCart;
  }
  return cart;
}

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const url = new URL(req.url);
  const user_uuid = url.searchParams.get("uuid");
  const guest_uuid = cookieStore.get("guest_uuid")?.value;
  const language = url.searchParams.get("lang") || "en";

  const customer_uuid = user_uuid || guest_uuid;
  if (!customer_uuid) return NextResponse.json([]);

  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("customer_uuid", customer_uuid)
    .single();
  if (cartError) throw cartError;
  if (!cart) return NextResponse.json([]);

  const { data: items, error: itemsError } = await supabase
    .from("cart_items")
    .select("id, quantity, product_id")
    .eq("cart_id", cart.id);
  if (itemsError) throw itemsError;
  if (!items) return NextResponse.json([]);

  const productIds = items.map((item) => item.product_id);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);
  if (productsError) throw productsError;
  if (!products) return NextResponse.json([]);

  const formatted = items.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    return {
      id: item.id,
      quantity: item.quantity,
      products: {
        id: product?.id,
        price: product?.price,
        image_url: product?.image_url,
        name: language === "en" ? product?.name_english : product?.name_arabic,
      },
    };
  });
  return NextResponse.json(formatted);
}

export async function POST(req: Request) {
  try {
    const { product_id, quantity = 1, user_uuid } = await req.json();

    const cookieStore = await cookies();
    let guest_uuid = cookieStore.get("guest_uuid")?.value;

    const res = NextResponse.json({ success: true });

    let customer_uuid = user_uuid;
    if (!customer_uuid) {
      if (!guest_uuid) {
        guest_uuid = uuidv4();
        res.cookies.set("guest_uuid", guest_uuid, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
      }
      customer_uuid = guest_uuid!;
    }

    const cart = await getOrCreateCart(customer_uuid);

    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id)
      .eq("product_id", product_id)
      .single();

    if (existingItem) {
      await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id);
    } else {
      await supabase
        .from("cart_items")
        .insert([{ cart_id: cart.id, product_id, quantity }]);
    }

    return res;
  } catch (err) {
    console.error("Cart POST error:", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { item_id, quantity } = await req.json();

    await supabase.from("cart_items").update({ quantity }).eq("id", item_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { item_id } = await req.json();
    await supabase.from("cart_items").delete().eq("id", item_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
