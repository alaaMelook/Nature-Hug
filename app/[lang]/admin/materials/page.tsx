// app/admin/materials/page.tsx  
import { Suspense } from "react";
import { MaterialsTable } from "@/ui/components/admin/materials-table";
import { Loader2 } from "lucide-react";
import { GetAllMaterials } from "@/domain/use-case/admin/materials";

export default async function MaterialsPage() {
  const materials = await new GetAllMaterials().execute();
  materials.sort((a, b) => (a.stock_grams || 0) - (b.stock_grams || 0));

  return (
    <div className="p-6">

      <Suspense fallback={<Loader2 className=" w-10 h-10 inline-block animate-spin mr-2" size={16} />}>
        <MaterialsTable
          initialMaterials={materials}
        // units={units}
        // suppliers={suppliers}
        // products={products}
        />
      </Suspense>
    </div>
  );
}
