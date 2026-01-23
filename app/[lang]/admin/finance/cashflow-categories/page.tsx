"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";

interface Category {
    id: number;
    name: string;
    exclude_from_opex: boolean;
    created_at: string;
}

export default function CashflowCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [newCategoryName, setNewCategoryName] = useState("");

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/admin/finance/cashflow-categories");
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = async () => {
        if (!newCategoryName.trim()) {
            alert("Name is required");
            return;
        }

        const res = await fetch("/api/admin/finance/cashflow-categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newCategoryName }),
        });

        if (res.ok) {
            setAdding(false);
            setNewCategoryName("");
            fetchCategories();
        } else {
            const data = await res.json();
            alert("Error: " + (data.error || "Try again"));
        }
    };

    const handleUpdate = async () => {
        if (!editing) return;

        const res = await fetch(`/api/admin/finance/cashflow-categories/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: editing.name }),
        });

        if (res.ok) {
            setEditing(null);
            fetchCategories();
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        const res = await fetch(`/api/admin/finance/cashflow-categories/${id}`, { method: "DELETE" });
        if (res.ok) {
            setCategories(categories.filter((c) => c.id !== id));
        }
    };

    const handleToggleExclude = async (category: Category) => {
        const newValue = !category.exclude_from_opex;

        // Optimistic update
        setCategories(categories.map(c =>
            c.id === category.id ? { ...c, exclude_from_opex: newValue } : c
        ));

        try {
            const res = await fetch(`/api/admin/finance/cashflow-categories/${category.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: category.name, exclude_from_opex: newValue }),
            });

            if (!res.ok) {
                throw new Error("Failed to update");
            }
        } catch (error) {
            console.error(error);
            // Revert on error
            setCategories(categories.map(c =>
                c.id === category.id ? { ...c, exclude_from_opex: !newValue } : c
            ));
            alert("Failed to update status");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Tag className="w-8 h-8 text-primary-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Cashflow Categories</h1>
                    </div>
                    <button
                        onClick={() => setAdding(true)}
                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Add Category
                    </button>
                </div>

                {/* Categories Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exclude from OPEX</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No categories found. Add a new one!</td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.name}</td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={cat.exclude_from_opex || false}
                                                onChange={() => handleToggleExclude(cat)}
                                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditing(cat)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Add Modal */}
                {adding && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-96 space-y-4">
                            <h2 className="text-lg font-semibold">Add New Category</h2>

                            <input
                                type="text"
                                placeholder="Category Name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setAdding(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editing && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-96 space-y-4">
                            <h2 className="text-lg font-semibold">Edit Category</h2>

                            <input
                                type="text"
                                value={editing.name}
                                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setEditing(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
