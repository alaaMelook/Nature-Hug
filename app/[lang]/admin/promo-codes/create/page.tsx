import { ViewAllWithDetails } from "@/domain/use-case/admin/products/viewAllWithDetails";
import { ViewProfile } from "@/domain/use-case/store/viewProfile";
import CreatePromoCodeForm from "@/ui/client-screens/admin/create-promo-code-form";

export default async function CreatePromoCodePage() {
    const [products, customers] = await Promise.all([
        new ViewAllWithDetails().execute(),
        new ViewProfile().executeForAll()
    ]);

    return <CreatePromoCodeForm products={products} customers={customers || []} />;
}
