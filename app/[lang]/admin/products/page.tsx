import { GetAllMaterials } from "@/domain/use-case/admin/materials";
import { ProductsScreen } from "@/ui/client-screens/admin/products-screen";
import { GetAllProductsWithDetails } from "@/domain/use-case/admin/products";

export default async function ProductsPage() {
    const materials = await new GetAllMaterials().execute();
    const products = await new GetAllProductsWithDetails().execute();
    return (<ProductsScreen materials={materials} products={products} />);
}