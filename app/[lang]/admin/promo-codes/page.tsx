import { GetAllPromoCodes } from "@/domain/use-case/admin/promo-codes/getAllPromoCodes";
import PromoCodesScreen from "@/ui/client-screens/admin/promo-codes-screen";

export default async function PromoCodesPage() {
    const promoCodes = await new GetAllPromoCodes().execute();

    return <PromoCodesScreen initialPromoCodes={promoCodes} />;
}
