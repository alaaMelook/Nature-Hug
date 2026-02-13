import { GetAllMaterials } from "@/domain/use-case/admin/materials";
import { GetAllProductsWithDetails } from "@/domain/use-case/admin/products";
import PackagingRulesScreen from "@/ui/client-screens/admin/packaging-rules-screen";

export default async function PackagingRulesPage() {
    const materials = await new GetAllMaterials().execute();
    const products = await new GetAllProductsWithDetails().execute();

    // Map products to simple {id, name} for the packaging rules screen
    const productOptions = products.map(p => ({
        id: p.product_id,
        name: p.name_en || p.name_ar || `Product ${p.product_id}`,
    }));

    return <PackagingRulesScreen initialMaterials={materials} initialProducts={productOptions} />;
}
