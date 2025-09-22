"use client";

import { useEffect, useState } from "react";

export default function ProductionPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [doneLoading, setDoneLoading] = useState(false);

  // fetch products
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

  // handle production request (preview requirements only)
  const handleProduction = async () => {
    if (!selectedProduct) {
      alert("Please select a product ✅");
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
          preview: true, // مهم: علشان ميخصمش لسه
        }),
      });

      const data = await res.json();
      console.log("Production API result:", data);

      if (!res.ok) {
        alert("Error: " + data.error);
      } else {
        setRequirements(data.requirements || []);
      }
    } catch (err) {
      alert("Server connection error ❌");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // confirm production (deduct stock)
  const handleDone = async () => {
    if (!selectedProduct) return;
    if (requirements.length === 0) {
      alert("Please generate requirements first.");
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
      console.log("Done API result:", data);

      if (!res.ok) {
        alert("Error: " + data.error);
      } else {
        alert("✅ Production done successfully, stock updated!");
        setRequirements([]); // فضي الجدول
        setQty(1);
        setSelectedProduct(null);
      }
    } catch (err) {
      alert("Server connection error ❌");
      console.error(err);
    } finally {
      setDoneLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">⚙️ Production</h1>

      {/* Select product */}
      <label className="block mb-2">Choose Product</label>
      <select
        className="border rounded p-2 w-full mb-4"
        value={selectedProduct?.id || ""}
        onChange={(e) => {
          const product = products.find((p) => p.id === Number(e.target.value));
          setSelectedProduct(product || null);
        }}
      >
        <option value="">-- Select Product --</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name_english || p.name}
          </option>
        ))}
      </select>

      {/* Quantity input */}
      <label className="block mb-2">Quantity</label>
      <input
        type="number"
        className="border rounded p-2 w-full mb-4"
        value={qty}
        min={1}
        onChange={(e) => setQty(Number(e.target.value))}
      />

      {/* Button */}
      <button
        onClick={handleProduction}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Processing..." : "Produce ✅"}
      </button>

      {/* Requirements Table */}
      {requirements.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            📋 Required Raw Materials
          </h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Material</th>
                <th className="border p-2">Needed Qty</th>
                <th className="border p-2">Available</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((r, i) => (
                <tr key={i}>
                  <td className="border p-2">{r.name}</td>
                  <td className="border p-2">{r.needQty}</td>
                  <td className="border p-2">{r.available}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Done button */}
          <div className="mt-4 text-right">
            <button
              onClick={handleDone}
              className="bg-green-600 text-white px-4 py-2 rounded"
              disabled={doneLoading}
            >
              {doneLoading ? "Updating stock..." : "Done ✅"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
