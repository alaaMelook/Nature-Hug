"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Unit {
  id: number;
  name: string;
}

export default function UnitsTable({ initialUnits }: { initialUnits: Unit[] }) {
  const [units, setUnits] = useState<Unit[]>(initialUnits || []);
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [name, setName] = useState("");
  const router = useRouter();

  const openAddModal = () => {
    setEditingUnit(null);
    setName("");
    setShowModal(true);
  };

  const openEditModal = (unit: Unit) => {
    setEditingUnit(unit);
    setName(unit.name);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a unit name.");
      return;
    }

    try {
      const method = editingUnit ? "PUT" : "POST";
      const body = editingUnit ? { id: editingUnit.id, name } : { name };

      const res = await fetch("/api/admin/units", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error saving unit");
      }

      setShowModal(false);
      router.refresh(); // ✅ تحديث الصفحة بطريقة Next.js
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this unit?")) return;

    try {
      const res = await fetch("/api/admin/units", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error deleting unit");
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={openAddModal}
          className="bg-amber-700 text-white px-3 py-2 rounded hover:bg-amber-800 transition"
        >
          + Add Unit
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-2 text-left">#</th>
            <th className="p-2 text-left">Unit Name</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u, i) => (
            <tr key={u.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{i + 1}</td>
              <td className="p-2">{u.name}</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => openEditModal(u)}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[350px]">
            <h3 className="text-lg font-semibold mb-4">
              {editingUnit ? "Edit Unit" : "Add Unit"}
            </h3>

            <input
              type="text"
              placeholder="Unit name (e.g. Gram, ML, Piece)"
              className="border w-full p-2 rounded mb-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-800 transition"
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
