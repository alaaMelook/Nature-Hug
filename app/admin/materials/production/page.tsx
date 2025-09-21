"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductionPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const result = await res.json();
        console.log("API Products:", result);
        setRawData(result);

        if (Array.isArray(result.products)) {
          setProducts(result.products);
        } else if (Array.isArray(result.data)) {
          setProducts(result.data);
        } else if (Array.isArray(result)) {
          setProducts(result);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleOk = () => {
    if (selectedProduct) {
      router.push(
        `/production/result?productId=${selectedProduct.id}&qty=${qty}`
      );
    } else {
      alert("من فضلك اختر منتج أولاً ✅");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">📦 تصنيع منتج</h1>

      {loading ? (
        <p>⏳ جاري تحميل المنتجات...</p>
      ) : (
        <>
          {/* اختيار المنتج */}
          <label className="block mb-2">اختر المنتج</label>
          <select
            className="border rounded p-2 w-full mb-4"
            onChange={(e) => {
              const product = products.find(
                (p) => p.id === Number(e.target.value)
              );
              setSelectedProduct(product || null);
            }}
            value={selectedProduct?.id || ""}
          >
            <option value="">-- اختر منتج --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name_arabic || p.name_english || p.name || `منتج ${p.id}`}
              </option>
            ))}
          </select>

          {/* إدخال الكمية */}
          <label className="block mb-2">الكمية</label>
          <input
            type="number"
            className="border rounded p-2 w-full mb-4"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            min={1}
          />

          {/* زرار أوكيه */}
          <button
            onClick={handleOk}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            أوكيه ✅
          </button>

        </>
      )}
    </div>
  );
}
