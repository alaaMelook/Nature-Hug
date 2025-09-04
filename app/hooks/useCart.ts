export async function addToCart(productId: number, customer_uuid: string) {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId, customer_uuid }),
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to add to cart");
  }
  return data;
}
