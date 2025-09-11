import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// جلب بيانات المنتج من Supabase
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

  if (!product) {
    return <div className="p-6 text-center text-red-600">Product not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex flex-col items-center">
        {product.image_url && (
          <img src={product.image_url} alt={product.name_english} className="w-60 h-60 object-cover rounded mb-4" />
        )}
        <h1 className="text-3xl font-bold mb-2">{product.name_english}</h1>
        <p className="mb-2">{product.description_english}</p>
        <p className="mb-2 text-gray-500">{product.description_arabic}</p>
        <p className="text-xl font-semibold mb-4">{product.price} EGP</p>
        {/* أزرار الشراء */}
        <div className="flex gap-4 mt-4">
          <button
            className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700"
            onClick={() => alert("Added to cart")}
          >
            Add to Cart
          </button>
          <button
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            onClick={() => alert("Buy Now!")}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}