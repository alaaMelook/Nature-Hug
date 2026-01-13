import { ViewAllProducts } from "@/domain/use-case/store/viewAllProducts";
import { ProductsScreen } from "@/ui/client-screens/(store)/products-screen";
import { GetAllCategories } from "@/domain/use-case/store/getAllCategories";

// Force dynamic rendering to ensure fresh category data
export const dynamic = 'force-dynamic';

export default async function Products({ params }: { params: Promise<{ lang?: string }> }) {
    const lang = (await params).lang as LangKey || 'ar';

    const [product, categories] = await Promise.all([
        new ViewAllProducts(lang).execute(),
        new GetAllCategories(lang).execute()
    ]);

    // Debug: Log products with category_names on server side
    console.log("[Products Page] Sample product category_names:", product.slice(0, 3).map(p => ({
        name: p.name,
        category_names: p.category_names,
        category_name: p.category_name
    })));

    return (
        <ProductsScreen initProducts={product} initCategories={categories} />
    );
}
