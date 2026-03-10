import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";
import { ViewMember } from "@/domain/use-case/admin/members";
import AnnouncementsScreen from "@/ui/client-screens/admin/announcements-screen";
import { redirect } from "next/navigation";

export default async function AnnouncementsPage() {
    const user = await new GetCurrentUser().execute();
    if (!user) redirect("/");

    let member;
    try {
        member = await new ViewMember().fromCustomerId({ customerId: user.id });
    } catch {
        redirect("/");
    }

    if (!member) redirect("/");

    const isAdmin = member.role === 'admin';

    return <AnnouncementsScreen isAdmin={isAdmin} memberRole={member.role} />;
}
