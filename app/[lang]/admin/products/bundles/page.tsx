import { Bundles } from "@/domain/use-case/admin/bundles";
import { BundlesScreen } from "@/ui/client-screens/admin/bundles-screen";

export default async function BundlesPage() {
    const bundles = await new Bundles().getAll();
    return <BundlesScreen bundles={bundles} />;
}
