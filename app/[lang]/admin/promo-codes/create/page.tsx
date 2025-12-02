import { ViewAllWithDetails } from "@/domain/use-case/admin/products/viewAllWithDetails";
import CreatePromoCodeForm from "@/ui/client-screens/admin/create-promo-code-form";

export default async function CreatePromoCodePage() {
    const products = await new ViewAllWithDetails().execute();

    return <CreatePromoCodeForm products={products} />;
}
