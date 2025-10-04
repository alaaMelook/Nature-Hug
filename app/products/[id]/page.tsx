import ProductDetail from "@/app/server-pages/ProductDetail";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

async function getProduct(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data;
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  return <ProductDetail product={product} />;
}