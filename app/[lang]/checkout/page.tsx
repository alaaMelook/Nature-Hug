import { GetAllGovernorates } from "@/domain/use-case/store/getAllGovernorates";
import { CheckoutGuestScreen } from "@/ui/client-screens/(store)/checkout-guest-screen";
import { CheckoutUserScreen } from "@/ui/client-screens/(store)/checkout-user-screen";
import { ViewProfile } from "@/domain/use-case/store/viewProfile";

export default async function CheckoutPage() {
    let governorates = await new GetAllGovernorates().execute();
    governorates = governorates.sort((a, b) => a.name_en.localeCompare(b.name_en))
    const user = await new ViewProfile().execute();


    if (user)
        return (
            <CheckoutUserScreen governorates={governorates} user={user} />
        );
    return (
        <CheckoutGuestScreen governorates={governorates} />
    );
}
