"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface Product {
  id: number;
  name_english: string;
}

interface Material {
  id: number;
  name: string;
}

interface Variant {
  id: number;
  product_id: number;
  name: string;
}

interface BOMRow {
  id: number;
  product_id: number;
  product_name: string;
  material_id: number;
  material_name: string;
  grams_used: number;
  unit_cost: number;
  total_cost: number;
  variant_id?: number;
  variant_name?: string;
}

export default function BomPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [rows, setRows] = useState<BOMRow[]>([]);

  const [manageProductId, setManageProductId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [materialId, setMaterialId] = useState("");
  const [grams, setGrams] = useState("");
  const [variantId, setVariantId] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [prodRes, matRes, bomRes, varRes] = await Promise.all([
          fetch("/api/admin/products").then((res) => res.json()),
          fetch("/api/admin/inventory").then((res) => res.json()),
          fetch("/api/admin/product-materials").then((res) => res.json()),
          fetch("/api/admin/variant_materials").then((res) => res.json()),
        ]);

        if (!isMounted) return;

        setProducts(prodRes.data || []);
        setMaterials(matRes.data || []);
        setRows([
          ...(bomRes.data || []),
          ...(varRes.data || []),
        ]); // دمج المنتجات والمكونات
        setVariants(varRes.data || []);
      } catch (err) {
        console.error("BOM fetch error:", err);
      }
    };

    fetchData();

    return () => {
      isMounted = false; // مهم عشان نتجنب setState بعد unmount
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manageProductId || !materialId || !grams) return;

    try {
      const body = {
        product_id: manageProductId,
        material_id: materialId,
        grams_used: grams,
        variant_id: variantId || null, // اختياري
      };

      const url = variantId ? "/api/admin/variant_materials" : "/api/admin/product-materials";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        setRows((prev) => [...prev, ...(data.data ? [data.data] : [])]);
        setGrams("");
        setMaterialId("");
        setVariantId("");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number, isVariant?: boolean) => {
    if (!confirm("Are you sure you want to delete this material?")) return;

    const url = isVariant ? `/api/admin/variant_materials?id=${id}` : `/api/admin/product-materials?id=${id}`;

    const res = await fetch(url, { method: "DELETE" });
    if (res.ok) {
      setRows((prev) => prev.filter((row) => row.id !== id));
    } else {
      const data = await res.json();
      alert("Error deleting: " + data.error);
    }
  };

  const handleEdit = async (id: number, grams_used: number, isVariant?: boolean) => {
    const url = isVariant ? `/api/admin/variant_materials` : `/api/admin/product-materials`;

    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, grams_used }),
    });

    if (res.ok) {
      setRows((prev) =>
        prev.map((row) =>
          row.id === id
            ? { ...row, grams_used, total_cost: grams_used * row.unit_cost }
            : row
        )
      );
    } else {
      const data = await res.json();
      alert("Error updating: " + data.error);
    }
  };

  const groupedRows = products.map((product) => {
    const productRows = rows.filter((row) => row.product_id === product.id);
    const total_cost = productRows.reduce((sum, row) => sum + row.total_cost, 0);
    return {
      id: product.id,
      product_name: product.name_english,
      total_cost,
    };
  });

  const columns: GridColDef[] = [
    { field: "product_name", headerName: "Product", flex: 1 },
    { field: "total_cost", headerName: "Total Cost", flex: 1 },
    {
      field: "manage",
      headerName: "Manage",
      flex: 1,
      renderCell: (params) => (
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          onClick={() => {
            setManageProductId(params.row.id);
            setShowModal(true);
          }}
        >
          Manage
        </button>
      ),
    },
  ];

  const modalRows = rows.filter((row) => row.product_id === manageProductId);
  const modalColumns: GridColDef[] = [
    { field: "material_name", headerName: "Material", flex: 1 },
    { field: "variant_name", headerName: "Variant", flex: 1 },
    { field: "grams_used", headerName: "Grams Used", flex: 1 },
    { field: "unit_cost", headerName: "Unit Cost", flex: 1 },
    { field: "total_cost", headerName: "Total Cost", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              const newGrams = prompt(
                "Enter new grams:",
                params.row.grams_used.toString()
              );
              if (newGrams) handleEdit(params.row.id, parseFloat(newGrams), !!params.row.variant_id);
            }}
            className="text-blue-600 hover:underline text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(params.row.id, !!params.row.variant_id)}
            className="text-red-600 hover:underline text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bill of Materials (BOM)</h1>

      <div style={{ height: 500, width: "100%" }}>
        <DataGrid rows={groupedRows} columns={columns} getRowId={(row) => row.id} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[600px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Manage Materials for{" "}
              {products.find((p) => p.id === manageProductId)?.name_english}
            </h2>

            <div style={{ height: 300, width: "100%" }}>
              <DataGrid
                rows={modalRows}
                columns={modalColumns}
                getRowId={(row) => row.id}
                hideFooter
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              {variants.filter(v => v.product_id === manageProductId).length > 0 && (
                <div>
                  <label className="block mb-1">Variant (optional)</label>
                  <select
                    value={variantId}
                    onChange={(e) => setVariantId(e.target.value)}
                    className="border p-2 w-full"
                  >
                    <option value="">Select variant (or none)</option>
                    {variants
                      .filter(v => v.product_id === manageProductId)
                      .map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block mb-1">Material</label>
                <select
                  value={materialId}
                  onChange={(e) => setMaterialId(e.target.value)}
                  className="border p-2 w-full"
                >
                  <option value="">Select material</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Grams Used</label>
                <input
                  type="number"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  className="border p-2 w-full"
                />
              </div>

              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Add Material
              </button>
            </form>

            <button
              className="mt-6 text-red-600 hover:underline w-full"
              onClick={() => {
                setShowModal(false);
                setManageProductId(null);
                setMaterialId("");
                setGrams("");
                setVariantId("");
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
