import { ViewProduct } from "@/domain/use-case/shop/viewProduct";
import { ProductDetailScreen } from "@/ui/client-screens/(store)/product-detail-screen";

export default async function ProductPage({ params }: { params: { slug: string, lang?: string } }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const lang = resolvedParams.lang as LangKey;
    const initProduct = await new ViewProduct(lang).execute(slug);
    console.log('init product', initProduct);
    return (
        <ProductDetailScreen initProduct={initProduct} />
    );
}

