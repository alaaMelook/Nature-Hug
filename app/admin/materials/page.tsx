import { Suspense } from "react";
import MaterialsTable from "./materials-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Material, Unit, Supplier, Category } from "./types";

async function getMaterials() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("materials")
    .select("*, unit:units(*), supplier:suppliers(id, name)")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

async function getUnits() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("units").select("*");
  return data || [];
}

async function getSuppliers() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("suppliers").select("id, name");
  return data || [];
}

async function getCategories() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("categories").select("id, name_english");
  return data || [];
}

export default async function MaterialsPage() {
  const [materials, units, suppliers, categories]: [
    Material[],
    Unit[],
    Supplier[],
    Category[]
  ] = await Promise.all([getMaterials(), getUnits(), getSuppliers(), getCategories()]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Materials Management</h1>
      <Suspense fallback={<p>Loading materials...</p>}>
        <MaterialsTable
          initialMaterials={materials}
          units={units}
          suppliers={suppliers}
          categories={categories}
        />
      </Suspense>
    </div>
  );
}
