import {ViewAllProducts} from "@/domain/use-case/shop/viewAllProducts";
import {ProductsScreen} from "@/ui/client-screens/(store)/products-screen";
import {GetAllCategories} from "@/domain/use-case/shop/getAllCategories";

export default function Products() {
    const product = new ViewAllProducts().execute();
    const categories = new GetAllCategories().execute();
    return (
        <ProductsScreen initProducts={product} initCategories={categories}/>
    );
}
