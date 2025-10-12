// app/admin/products/page.tsx
import { Suspense } from "react";
import ProductsTable from "./products-table";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";


async function getCategories() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export default async function ProductsPage() {
  const categories = await getCategories();

  return (
    <div className="p-6">

      <Suspense fallback={<p>Loading products...</p>}>
        <ProductsTable categories={categories} />
      </Suspense>
    </div>
  );
}