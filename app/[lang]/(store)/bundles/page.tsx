import { IProductServerRepository } from "@/data/repositories/server/iProductsRepository";
import { BundlesListScreen } from "@/ui/client-screens/(store)/bundles-list-screen";

export const dynamic = 'force-dynamic';

export default async function BundlesPage({ params }: { params: Promise<{ lang?: string }> }) {
    const lang = ((await params).lang as LangKey) || 'ar';
    const repo = new IProductServerRepository(lang);
    const bundles = await repo.getStorefrontBundles();

    return (
        <BundlesListScreen initBundles={bundles} lang={lang} />
    );
}
