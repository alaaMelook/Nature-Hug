import { ViewAllProducts } from "@/domain/use-case/store/viewAllProducts";
import { ProductsScreen } from "@/ui/client-screens/(store)/products-screen";
import { GetAllCategories } from "@/domain/use-case/store/getAllCategories";
import { IProductServerRepository } from "@/data/repositories/server/iProductsRepository";

// Force dynamic rendering to ensure fresh category data
export const dynamic = 'force-dynamic';

export default async function Products({ params }: { params: Promise<{ lang?: string }> }) {
    const lang = (await params).lang as LangKey || 'ar';

    const [products, categories, bundles] = await Promise.all([
        new ViewAllProducts(lang).execute(),
        new GetAllCategories(lang).execute(),
        new IProductServerRepository(lang).getStorefrontBundles(),
    ]);

    // Merge bundles into products list — they carry product_type='bundle'
    // and category_names includes 'Bundles' so the filter works automatically
    const allItems = [...products, ...bundles];

    return (
        <ProductsScreen initProducts={allItems} initCategories={categories} hasBundles={bundles.length > 0} />
    );
}
