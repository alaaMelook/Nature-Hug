import { Suspense } from "react";
import MaterialsTable from "./materials-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Material, Unit, Supplier } from "./types";

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
  const { data, error } = await supabase.from("units").select("*");
  return data || [];
}

async function getSuppliers() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("suppliers").select("id, name");
  return data || [];
}

export default async function MaterialsPage() {
  const [materials, units, suppliers]: [Material[], Unit[], Supplier[]] = await Promise.all([
    getMaterials(),
    getUnits(),
    getSuppliers(),
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Materials Management</h1>
      <Suspense fallback={<p>Loading materials...</p>}>
        <MaterialsTable initialMaterials={materials} units={units} suppliers={suppliers} />
      </Suspense>
    </div>
  );
}