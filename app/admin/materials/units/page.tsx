import UnitsTable from "./units-table"
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getUnits() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("units").select("*").order("id", { ascending: true });
  return data || [];
}

export default async function UnitsPage() {
  const units = await getUnits();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Units Management</h1>
      <UnitsTable initialUnits={units} />
    </div>
  );
}
