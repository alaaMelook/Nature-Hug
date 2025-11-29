import { ViewProduct } from "@/domain/use-case/shop/viewProduct";
import { ProductDetailScreen } from "@/ui/client-screens/(store)/product-detail-screen";
import { ViewSimilarProducts } from "@/domain/use-case/shop/viewSimilarProducts";

export default async function ProductPage({ params }: { params: Promise<{ slug: string, lang?: string }> }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const lang = resolvedParams.lang as LangKey;
    const initProduct = await new ViewProduct(lang).execute(slug);

    const similarProducts = await new ViewSimilarProducts(lang).execute(slug);

    return (
        <ProductDetailScreen initProduct={initProduct} similarProducts={similarProducts} />
    );
}

