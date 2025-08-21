import { supabase } from "@/lib/supabaseClient"
import { NextResponse } from "next/server"

// get cart items
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const customerId = searchParams.get("customerId")

  if (!customerId) return NextResponse.json({ error: "Missing customerId" }, { status: 400 })

  const { data, error } = await supabase
    .from("cart_items")
    .select("id, quantity, products(*)")
    .eq("cart_id", customerId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// add to cart
export async function POST(req: Request) {
  const body = await req.json()
  const { cart_id, product_id, quantity } = body

  const { data, error } = await supabase.from("cart_items").upsert([
    { cart_id, product_id, quantity }
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
