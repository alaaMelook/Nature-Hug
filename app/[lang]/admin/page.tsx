import { GetSidebarStats } from "@/domain/use-case/admin/getSidebarStats";
import { AdminDashboardScreen } from "@/ui/client-screens/admin/admin-dashboard-screen";

export default async function AdminDashboard() {
    const [actionStats] = await Promise.all([
        new GetSidebarStats().execute()
    ]);

    return (
        <AdminDashboardScreen actionStats={actionStats} />
    )
}