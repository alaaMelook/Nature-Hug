import {GetAdminDashboardStats} from "@/domain/use-case/admin/getAdminDashboardStats";
import {Orders} from "@/domain/use-case/admin/orders";
import {AdminDashboardScreen} from "@/ui/client-screens/admin/admin-dashboard-screen";

export default async function AdminDashboard() {
    const dashboard = await new GetAdminDashboardStats().execute();
    const recentOrders = await new Orders().getRecent();

    console.log('Dashboard:', dashboard);
    return (
        <AdminDashboardScreen dashboard={dashboard} recentOrders={recentOrders}/>
    )
}