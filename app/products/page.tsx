"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Product {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  image_url?: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("products").select("*");

        if (error) {
          setError(error.message);
          console.error("Supabase error:", error);
          return;
        }

        const formattedProducts: Product[] = (data || []).map((product) => ({
          ...product,
          price: Number(product.price) || 0,
          id: product.id.toString(),
        }));

        setProducts(formattedProducts);
      } catch (err) {
        setError("Failed to fetch products");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="py-8">
        <h1 className="text-2xl font-bold mb-6">🛒 Products</h1>
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <h1 className="text-2xl font-bold mb-6">🛒 Products</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-8">
        <h1 className="text-2xl font-bold mb-6">🛒 Products</h1>
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">No products available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-6">🛒 Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded p-4 shadow">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover mb-3 rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <h2 className="font-semibold text-lg">{product.name}</h2>
            {product.description && (
              <p className="text-sm text-gray-600 mt-2">
                {product.description}
              </p>
            )}
            <p className="mt-2 text-lg font-bold">
              ${product.price.toFixed(2)}
            </p>
            <div className="mt-3 px-4 py-2 bg-gray-200 text-gray-600 rounded text-center">
              View Details
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
