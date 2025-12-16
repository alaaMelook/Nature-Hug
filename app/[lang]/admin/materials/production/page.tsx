"use client";

import { useEffect, useState } from "react";

export default function ProductionPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [doneLoading, setDoneLoading] = useState(false);

  // 🧩 Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        setProducts(data.data || data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  // 🧮 Preview production requirements
  const handleProduction = async () => {
    if (!selectedProduct) {
      alert("⚠️ Please select a product first!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          qty,
          preview: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert("Error: " + data.error);
      } else {
        setRequirements(data.requirements || []);
      }
    } catch (err) {
      alert("❌ Server connection error!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Confirm production (update stock)
  const handleDone = async () => {
    if (!selectedProduct) return;
    if (requirements.length === 0) {
      alert("⚠️ Please generate requirements first.");
      return;
    }

    setDoneLoading(true);
    try {
      const res = await fetch("/api/admin/production/done", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          qty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Error: " + data.error);
      } else {
        alert("✅ Production completed successfully!");
        setRequirements([]);
        setQty(1);
        setSelectedProduct(null);
      }
    } catch (err) {
      alert("❌ Server connection error!");
      console.error(err);
    } finally {
      setDoneLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          ⚙️ Production Management
        </h1>

        {/* Product Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🧴 Select Product
            </label>
            <select
              className="border rounded-lg p-2 w-full bg-gray-50 focus:ring-2 focus:ring-blue-500"
              value={selectedProduct?.id || ""}
              onChange={(e) => {
                const product = products.find(
                  (p) => p.id === Number(e.target.value)
                );
                setSelectedProduct(product || null);
              }}
            >
              <option value="">-- Choose Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name_arabic || p.name_english || p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔢 Quantity
            </label>
            <input
              type="text" inputMode="numeric" pattern="[0-9]*"

              className="border rounded-lg p-2 w-full bg-gray-50 focus:ring-2 focus:ring-blue-500"
              value={qty}
              min={1}
              onChange={(e) => setQty(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={handleProduction}
            disabled={loading}
            className={`flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {loading ? "⏳ Processing..." : "🔍 Preview Requirements"}
          </button>

          <button
            onClick={handleDone}
            disabled={doneLoading || requirements.length === 0}
            className={`flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition ${doneLoading || requirements.length === 0
                ? "opacity-70 cursor-not-allowed"
                : ""
              }`}
          >
            {doneLoading ? "Updating stock..." : "✅ Confirm Production"}
          </button>
        </div>

        {/* Requirements Table */}
        {requirements.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              📦 Required Raw Materials
            </h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-800">
                  <tr>
                    <th className="text-left py-2 px-4 border-b">Material</th>
                    <th className="text-center py-2 px-4 border-b">
                      Needed Qty
                    </th>
                    <th className="text-center py-2 px-4 border-b">
                      Available
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.map((r, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 transition border-b last:border-0"
                    >
                      <td className="py-2 px-4">{r.name}</td>
                      <td className="py-2 px-4 text-center">{r.needQty}</td>
                      <td
                        className={`py-2 px-4 text-center font-medium ${r.available < r.needQty
                            ? "text-red-600"
                            : "text-green-600"
                          }`}
                      >
                        {r.available}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center italic mt-4">
            🧾 No requirements yet. Choose a product and preview first.
          </p>
        )}
      </div>
    </div>
  );
}
