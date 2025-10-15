"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/data/supabase/client";
import { Plus, Trash2 } from "lucide-react";

type Category = {
  id: number;
  name_english: string;
  name_arabic: string | null;
};

export default function CategoriesPage() {

  const [categories, setCategories] = useState<Category[]>([]);
  const [nameEnglish, setNameEnglish] = useState("");
  const [nameArabic, setNameArabic] = useState("");

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCategories(data);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!nameEnglish.trim()) return alert("English name is required");

    const { error } = await supabase
      .from("categories")
      .insert([{ name_english: nameEnglish, name_arabic: nameArabic }]);

    if (error) {
      alert(error.message);
    } else {
      setNameEnglish("");
      setNameArabic("");
      fetchCategories();
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      alert(error.message);
    } else {
      fetchCategories();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>

      {/* Add Form */}
      <div className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="English name"
          value={nameEnglish}
          onChange={(e) => setNameEnglish(e.target.value)}
          className="w-full border px-3 py-2 rounded-md text-sm"
        />
        <input
          type="text"
          placeholder="Arabic name (optional)"
          value={nameArabic}
          onChange={(e) => setNameArabic(e.target.value)}
          className="w-full border px-3 py-2 rounded-md text-sm"
        />
        <button
          onClick={handleAdd}
          className="flex items-center px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="border rounded-md divide-y">
        {categories.length > 0 ? (
          categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between px-4 py-2"
            >
              <div>
                <p className="font-medium">{c.name_english}</p>
                {c.name_arabic && (
                  <p className="text-sm text-gray-500">{c.name_arabic}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        ) : (
          <p className="p-4 text-gray-500 text-sm">No categories found.</p>
        )}
      </div>
    </div>
  );
}