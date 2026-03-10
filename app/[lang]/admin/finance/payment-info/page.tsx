import { redirect } from "next/navigation";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";
import { ViewMember } from "@/domain/use-case/admin/members";
import PaymentInfoScreen from "@/ui/client-screens/admin/payment-info-screen";

export default async function PaymentInfoPage() {
    const user = await new GetCurrentUser().execute();
    if (!user) redirect("/");

    let member;
    try {
        member = await new ViewMember().fromCustomerId({ customerId: user.id });
    } catch {
        redirect("/");
    }

    if (!member || member.role !== 'admin') redirect("/admin");

    return <PaymentInfoScreen />;
}
