// app/admin/materials/page.tsx  
import { Suspense } from "react";
import MaterialsTable from "./materials-table";
import { createSupabaseServerClient } from "@/data/supabase/server";

async function getMaterials() {
  const supabase = await supabase();
  const { data } = await supabase
    .from("materials")
    .select(`
    *,
    supplier:suppliers(id, name),
    unit:units(id, name),
    products:material_products(
      product:products(id, name_english, name_arabic)
    )
  `)
    .order("created_at", { ascending: false });
  return data || [];
}

async function getUnits() {
  const supabase = await supabase();
  const { data } = await supabase.from("units").select("*");
  return data || [];
}

async function getSuppliers() {
  const supabase = await supabase();
  const { data } = await supabase.from("suppliers").select("id, name");
  return data || [];
}

async function getProducts() {
  const supabase = await supabase();
  const { data } = await supabase.from("products").select("id, name_english, name_arabic");
  return data || [];
}

export default async function MaterialsPage() {
  const [materials, units, suppliers, products] = await Promise.all([
    getMaterials(),
    getUnits(),
    getSuppliers(),
    getProducts(),
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Materials Management</h1>
      <Suspense fallback={<p>Loading materials...</p>}>
        <MaterialsTable
          initialMaterials={materials}
          units={units}
          suppliers={suppliers}
          products={products}
        />
      </Suspense>
    </div>
  );
}
