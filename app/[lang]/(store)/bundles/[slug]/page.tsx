import { IProductServerRepository } from "@/data/repositories/server/iProductsRepository";
import { notFound } from "next/navigation";
import { BundleCustomizerScreen } from "@/ui/client-screens/(store)/bundle-customizer-screen";

export const dynamic = 'force-dynamic';

export default async function BundleDetailPage({
    params
}: {
    params: Promise<{ slug: string; lang?: string }>
}) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const lang = (resolvedParams.lang as LangKey) || 'ar';

    const repo = new IProductServerRepository(lang);
    const bundle = await repo.getStorefrontBundleDetail(slug);

    if (!bundle) {
        return notFound();
    }

    return (
        <BundleCustomizerScreen bundle={bundle} lang={lang} />
    );
}
