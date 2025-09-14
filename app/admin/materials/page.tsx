import { Suspense } from "react";
import MaterialsTable from "./materials-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getMaterials() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching materials:", error);
    return [];
  }

  return data || [];
}

export default async function MaterialsPage() {
  const materials = await getMaterials();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Materials Management</h1>
      <Suspense fallback={<p>Loading materials...</p>}>
        <MaterialsTable initialMaterials={materials} />
      </Suspense>
    </div>
  );
}