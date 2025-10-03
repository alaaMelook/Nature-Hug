// app/admin/materials/page.tsx
import { Suspense } from "react";
import MaterialsTable from "./materials-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Material, Unit, Supplier, Product } from "./types";

async function getMaterials(): Promise<Material[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("materials")
    .select(`
      *,
      supplier:suppliers(id, name),
      material_products(
        product:products(id, name_english, name_arabic)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMaterials error:", error);
    return [];
  }
  return data || [];
}

async function getUnits(): Promise<Unit[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("units").select("*");
  return data || [];
}

async function getSuppliers(): Promise<Supplier[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("suppliers").select("id, name");
  return data || [];
}

async function getProducts(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
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
        {/* ✅ مفيش setState هنا، كله بيروح props */}
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
