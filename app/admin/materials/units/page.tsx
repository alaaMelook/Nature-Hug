"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

type Unit = {
  id: number;
  name: string;
  abbreviation: string | null;
  created_at?: string;
};

export default function ManageUnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const router = useRouter();

  // 🟢 Fetch units
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/units");
      const data = await res.json();
      setUnits(data || []);
    })();
  }, []);

  const openAddModal = () => {
    setEditingUnit(null);
    setName("");
    setAbbreviation("");
    setShowModal(true);
  };

  const openEditModal = (unit: Unit) => {
    setEditingUnit(unit);
    setName(unit.name);
    setAbbreviation(unit.abbreviation || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    const method = editingUnit ? "PUT" : "POST";
    const body = editingUnit ? { id: editingUnit.id, name, abbreviation } : { name, abbreviation };

    const res = await fetch("/api/admin/units", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Error saving unit");
      return;
    }

    setShowModal(false);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this unit?")) return;

    const res = await fetch("/api/admin/units", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Error deleting unit (probably linked materials exist)");
      return;
    }

    router.refresh();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Units</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={openAddModal}
          className="px-3 py-2 bg-amber-700 text-white rounded flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Unit
        </button>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Abbreviation</th>
            <th className="p-2 border w-[120px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u) => (
            <tr key={u.id}>
              <td className="p-2 border">{u.name}</td>
              <td className="p-2 border">{u.abbreviation || "-"}</td>
              <td className="p-2 border text-center">
                <button
                  onClick={() => openEditModal(u)}
                  className="text-blue-600 hover:text-blue-800 mx-1"
                >
                  <Edit className="inline h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="text-red-600 hover:text-red-800 mx-1"
                >
                  <Trash2 className="inline h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
          {units.length === 0 && (
            <tr>
              <td colSpan={3} className="p-3 text-center text-gray-500">
                No units found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🟡 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px]">
            <h3 className="text-lg font-semibold mb-4">
              {editingUnit ? "Edit Unit" : "Add Unit"}
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Unit Name"
                className="border w-full p-2 rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Abbreviation (optional)"
                className="border w-full p-2 rounded"
                value={abbreviation}
                onChange={(e) => setAbbreviation(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
