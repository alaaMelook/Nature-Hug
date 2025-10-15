import ProductDetail from "@/ui/screens/ProductDetail";
import { createSupabaseServerClient } from "@/data/supabase/server";

async function getProduct(id: string) {
  const supabase = await supabase();
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