'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/lib/CartContext";

type Product = {
  id: string | number;
  name: string;
  description?: string;
  price: number | string;
  image_url?: string | null;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (!error) setProducts((data as Product[]) || []);
    };
    fetchProducts();
  }, []);

  const handleAdd = (p: Product) => {
    addToCart({
      product_id: Number(p.id),
      name: p.name,
      price: Number(p.price) || 0,
      image_url: p.image_url ?? undefined,
      quantity: 1
    });
    alert(`Added: ${p.name}`);
  };

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-6">🛒 Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="border rounded p-4 shadow">
            <h2 className="font-semibold">{p.name}</h2>
            {p.description && <p className="text-sm text-gray-600">{p.description}</p>}
            <p className="mt-2">💲 {p.price}</p>
            <button
              onClick={() => handleAdd(p)}
              className="mt-3 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ➕ Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
