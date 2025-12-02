import { GetAdminDashboardStats } from "@/domain/use-case/admin/getAdminDashboardStats";
import { GetSidebarStats } from "@/domain/use-case/admin/getSidebarStats";
import { AdminDashboardScreen } from "@/ui/client-screens/admin/admin-dashboard-screen";

export default async function AdminDashboard() {
    const dashboard = await new GetAdminDashboardStats().execute();
    const actionStats = await new GetSidebarStats().execute();

    return (
        <AdminDashboardScreen dashboard={dashboard} actionStats={actionStats} />
    )
}