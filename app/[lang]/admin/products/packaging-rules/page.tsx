import { GetAllMaterials } from "@/domain/use-case/admin/materials";
import { GetAllProductsWithDetails } from "@/domain/use-case/admin/products";
import PackagingRulesScreen from "@/ui/client-screens/admin/packaging-rules-screen";

export default async function PackagingRulesPage() {
    const materials = await new GetAllMaterials().execute();
    const products = await new GetAllProductsWithDetails().execute();

    // Deduplicate products (multi-category products appear multiple times)
    const seen = new Map<number, { name: string; variants: any[] }>();
    products.forEach(p => {
        if (!seen.has(p.product_id)) {
            seen.set(p.product_id, {
                name: p.name_en || p.name_ar || `Product ${p.product_id}`,
                variants: p.variants || [],
            });
        }
    });

    // Build flat list: products without variants stay as-is, products with variants show only variants
    const productOptions: { id: number; name: string; isVariant?: boolean; parentName?: string }[] = [];
    seen.forEach((val, productId) => {
        if (val.variants.length === 0) {
            // Product has no variants — show it directly
            productOptions.push({ id: productId, name: val.name });
        } else {
            // Product has variants — show only the variants
            val.variants.forEach((v: any) => {
                const variantName = v.name_en || v.name_ar || `Variant ${v.id}`;
                productOptions.push({ id: v.id, name: variantName });
            });
        }
    });

    return <PackagingRulesScreen initialMaterials={materials} initialProducts={productOptions} />;
}
