"use client";

import { useEffect, useState } from "react";

type Asset = {
  id: number; // أو string لو API يرجع string ids
  name: string;
  amount: number; // cost
  rate: number; // depreciation % per year
  category_id?: number;
};

type Category = {
  id: number;
  name: string;
  // overheads / assets under this category
  assets: Asset[];
};

export default function DepreciationSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // local form states
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryRate, setNewCategoryRate] = useState<number | "">("");
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cost"); // expected { ok: true, data: categories[] }
      const json = await res.json();
      if (json?.ok && Array.isArray(json.data)) {
        // normalize shape: each category should have assets array
        const normalized = json.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          assets: Array.isArray(c.overheads) ? c.overheads.map((o: any) => ({
            id: o.id,
            name: o.name,
            amount: Number(o.amount ?? 0),
            rate: Number(o.depreciation_rate ?? 0),
            category_id: c.id,
          })) : [],
        }));
        setCategories(normalized);
      } else {
        // fallback: empty
        setCategories([]);
      }
    } catch (err) {
      console.error("fetchCategories error:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  // Add new category (tries API, otherwise creates local temp)
  async function handleAddCategory(e?: React.FormEvent) {
    e?.preventDefault();
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    try {
      // try to POST to API (if you implemented /api/admin/cost/categories)
      const res = await fetch("/api/admin/cost/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim(), depreciation_rate: Number(newCategoryRate || 0) }),
      });
      const json = await res.json();
      if (json?.ok && json.data) {
        // API returned created category
        setCategories((prev) => [
          ...prev,
          { id: json.data.id, name: json.data.name, assets: [] },
        ]);
      } else {
        // fallback: create temporary id
        const tempId = Date.now();
        setCategories((prev) => [
          ...prev,
          { id: tempId, name: newCategoryName.trim(), assets: [] },
        ]);
      }
      setNewCategoryName("");
      setNewCategoryRate("");
    } catch (err) {
      console.error("add category error:", err);
      const tempId = Date.now();
      setCategories((prev) => [
        ...prev,
        { id: tempId, name: newCategoryName.trim(), assets: [] },
      ]);
      setNewCategoryName("");
      setNewCategoryRate("");
    } finally {
      setAddingCategory(false);
    }
  }

  // Add asset to category
  async function handleAddAsset(categoryId: number, name: string, amount: number, rate: number) {
    if (!name.trim()) return;
    // optimistic UI: attempt API POST to /api/admin/cost (overheads)
    try {
      const res = await fetch("/api/admin/cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: categoryId,
          name: name.trim(),
          amount,
          depreciation_rate: rate,
        }),
      });
      const json = await res.json();
      if (json?.ok && json.data && json.data.length > 0) {
        // if your API returns inserted row(s)
        const inserted = json.data[0];
        const asset: Asset = {
          id: inserted.id,
          name: inserted.name,
          amount: Number(inserted.amount ?? 0),
          rate: Number(inserted?.depreciation_rate ?? rate ?? 0),

          category_id: categoryId,
        };
        setCategories((prev) =>
          prev.map((c) => (c.id === categoryId ? { ...c, assets: [...c.assets, asset] } : c))
        );
        return;
      }
    } catch (err) {
      console.warn("API add asset failed (fallback to local)", err);
    }

    // fallback local add (temporary id)
    const tempAsset: Asset = {
      id: Date.now(),
      name: name.trim(),
      amount,
      rate,
      category_id: categoryId,
    };
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, assets: [...c.assets, tempAsset] } : c))
    );
  }

  // Update an existing asset (inline edit): tries PATCH to /api/admin/cost/:id
  async function handleUpdateAsset(catId: number, assetId: number, patch: Partial<Asset>) {
    // optimistic UI update
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              assets: c.assets.map((a) => (a.id === assetId ? { ...a, ...patch } : a)),
            }
          : c
      )
    );

    try {
      const res = await fetch(`/api/admin/cost/${assetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!json?.ok) {
        console.warn("Update API responded not ok", json);
      }
    } catch (err) {
      console.warn("Update asset API failed:", err);
    }
  }

  // Delete asset
  async function handleDeleteAsset(catId: number, assetId: number) {
    // optimistic remove
    setCategories((prev) => prev.map(c => c.id === catId ? { ...c, assets: c.assets.filter(a => a.id !== assetId) } : c));
    try {
      await fetch(`/api/admin/cost/${assetId}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Delete asset API failed:", err);
    }
  }

  // calculations
  const categoryAnnualDep = (cat: Category) =>
    cat.assets.reduce((s, a) => s + (a.amount * (a.rate || 0)) / 100, 0);

  const totalAnnualDep = categories.reduce((s, c) => s + categoryAnnualDep(c), 0);

  if (loading) return <div className="p-4">Loading categories...</div>;

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-3">Depreciation / Asset Consumption</h2>

      {/* Add Category */}
      <form onSubmit={handleAddCategory} className="mb-4 flex gap-2 items-center">
        <input
          placeholder="New category name (e.g. Furniture)"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="border px-2 py-1 rounded w-72"
        />
        <input
          type="number"
          placeholder="Default rate % (optional)"
          value={newCategoryRate === "" ? "" : String(newCategoryRate)}
          onChange={(e) => setNewCategoryRate(e.target.value === "" ? "" : Number(e.target.value))}
          className="border px-2 py-1 rounded w-40"
        />
        <button type="submit" disabled={addingCategory} className="bg-blue-600 text-white px-3 py-1 rounded">
          {addingCategory ? "Adding..." : "Add Category"}
        </button>
      </form>

      {/* Categories */}
      {categories.length === 0 ? (
        <p className="text-gray-500">No categories yet</p>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.id} className="border rounded p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{cat.name}</h3>
                <div className="text-sm">Annual Depreciation: <strong>{categoryAnnualDep(cat).toFixed(2)} EGP</strong></div>
              </div>

              {/* assets table */}
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Asset</th>
                    <th className="p-2 border">Cost (EGP)</th>
                    <th className="p-2 border">Rate %</th>
                    <th className="p-2 border">Annual Dep (EGP)</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.assets.map((a) => (
                    <tr key={a.id}>
                      <td className="p-2 border">
                        <input
                          type="text"
                          value={a.name}
                          onChange={(e) => handleUpdateAsset(cat.id, a.id, { name: e.target.value })}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          type="number"
                          value={a.amount}
                          onChange={(e) => handleUpdateAsset(cat.id, a.id, { amount: Number(e.target.value) })}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          type="number"
                          value={a.rate}
                          onChange={(e) => handleUpdateAsset(cat.id, a.id, { rate: Number(e.target.value) })}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="p-2 border text-right">
                        {((a.amount * (a.rate || 0)) / 100).toFixed(2)}
                      </td>
                      <td className="p-2 border text-center">
                        <button
                          className="text-red-600 text-sm"
                          onClick={() => handleDeleteAsset(cat.id, a.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Add asset form per category */}
              <AddAssetRow onAdd={(name, amount, rate) => handleAddAsset(cat.id, name, amount, rate)} defaultRate={0} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 font-bold">Total Annual Depreciation: {totalAnnualDep.toFixed(2)} EGP</div>
    </div>
  );
}

/* Small subcomponent: AddAssetRow */
function AddAssetRow({ onAdd, defaultRate }: { onAdd: (name: string, amount: number, rate: number) => void; defaultRate: number; }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [rate, setRate] = useState<number | "">(defaultRate);

  return (
    <div className="mt-3 flex gap-2 items-center">
      <input className="border px-2 py-1 rounded w-48" placeholder="Asset name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="border px-2 py-1 rounded w-32" placeholder="Cost" type="number" value={amount === "" ? "" : String(amount)} onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))} />
      <input className="border px-2 py-1 rounded w-24" placeholder="Rate %" type="number" value={rate === "" ? "" : String(rate)} onChange={(e) => setRate(e.target.value === "" ? "" : Number(e.target.value))} />
      <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => { if (!name || amount === "") return; onAdd(name, Number(amount), Number(rate || 0)); setName(""); setAmount(""); setRate(defaultRate); }}>Add Asset</button>
    </div>
  );
}
