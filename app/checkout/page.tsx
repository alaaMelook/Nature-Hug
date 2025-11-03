import {GetAllGovernorates} from "@/domain/use-case/shop/getAllGovernorates";
import {CheckoutGuestScreen} from "@/ui/client-screens/(store)/checkout-guest-screen";

export default async function CheckoutPage() {
    const governorates = await new GetAllGovernorates().execute();

    return (
        <CheckoutGuestScreen governorates={governorates} user={null}/>
    );
}
