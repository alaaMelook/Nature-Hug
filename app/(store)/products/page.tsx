import {ViewAllProducts} from "@/domain/use-case/shop/viewAllProducts";
import {ProductsScreen} from "@/ui/client-screens/(store)/products-screen";
import {GetAllCategories} from "@/domain/use-case/shop/getAllCategories";

export default async function Products() {
    const product = await new ViewAllProducts().execute();
    const categories = await new GetAllCategories().execute();
    return (
        <ProductsScreen initProducts={product} initCategories={categories}/>
    );
}
