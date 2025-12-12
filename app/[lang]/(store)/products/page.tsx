import { ViewAllProducts } from "@/domain/use-case/store/viewAllProducts";
import { ProductsScreen } from "@/ui/client-screens/(store)/products-screen";
import { GetAllCategories } from "@/domain/use-case/store/getAllCategories";

export default async function Products({ params }: { params: Promise<{ lang?: string }> }) {
    const lang = (await params).lang as LangKey || 'ar';

    const [product, categories] = await Promise.all([
        new ViewAllProducts(lang).execute(),
        new GetAllCategories(lang).execute()
    ]);
    return (
        <ProductsScreen initProducts={product} initCategories={categories} />
    );
}
