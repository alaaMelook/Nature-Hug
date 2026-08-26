import { SettingsScreen } from "@/ui/client-screens/admin/settings-screen";
import { AdminSettingsUseCase } from "@/domain/use-case/admin/settings";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";
import { ViewMember } from "@/domain/use-case/admin/members";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const user = await new GetCurrentUser().execute();
    if (!user) redirect("/");

    let member;
    try {
        member = await new ViewMember().fromCustomerId({ customerId: user.id });
    } catch {
        redirect("/");
    }

    if (!member) redirect("/");

    const settingsUseCase = new AdminSettingsUseCase();
    const settings = await settingsUseCase.getSettings();

    return <SettingsScreen initialSettings={settings} isAdmin={member.role === 'admin'} />;
}