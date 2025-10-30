import {useQuery} from "@tanstack/react-query";
import {getAdminDashboardStats} from "@/domain/use-case/admin/getAdminDashboardStats";
import {getRecentOrders} from "@/domain/use-case/admin/orders";
import {useSupabaseAuth} from "@/ui/providers/SupabaseAuthProvider";

export const useAdminDashboard = () => {

    const {session, loading} = useSupabaseAuth();
    return useQuery({
        enabled: !!session && !loading,
        queryKey: ["adminDashboardStats"],
        queryFn: async () => {
            console.log("[useAdminDashboard] Fetching admin dashboard stats.");
            const data = await new getAdminDashboardStats().execute();
            console.log("[useAdminDashboard] Fetched data:", data);
            return data;
        },

        select: (data) => {
            console.log("[useAdminDashboard] Selecting and transforming data.");
            const transformedData = {
                ...data,
                products_change: data.products_change ? data.products_change > 0 ? `+${data.products_change}%` : `${data.products_change}%` : '0%',
                orders_change: data.orders_change ? data.orders_change > 0 ? `+${data.orders_change}%` : `${data.orders_change}%` : '0%',
                revenue_change: data.revenue_change ? data.revenue_change > 0 ? `+${data.revenue_change}%` : `${data.revenue_change}%` : '0%',
                customers_change: data.customers_change ? data.customers_change > 0 ? `+${data.customers_change}%` : `${data.customers_change}%` : '0%',
                customers_change_status: data.customers_change > 0 ? "positive" : data.customers_change < 0 ? "negative" : "no-change",
                products_change_status: data.products_change > 0 ? "positive" : data.products_change < 0 ? "negative" : "no-change",
                orders_change_status: data.orders_change > 0 ? "positive" : data.orders_change < 0 ? "negative" : "no-change",
                revenue_change_status: data.revenue_change > 0 ? "positive" : data.revenue_change < 0 ? "negative" : "no-change",
            };
            console.log("[useAdminDashboard] Transformed data:", transformedData);
            return transformedData;
        }

    });
};

export const useRecentOrders = () => {
    const {session, loading} = useSupabaseAuth();
    return useQuery({
        enabled: !!session && !loading,
        queryKey: ["adminRecentOrders"],
        queryFn: async () => {
            console.log("[useRecentOrders] Fetching recent orders.");
            const data = await new getRecentOrders().execute();
            console.log("[useRecentOrders] Fetched data:", data);
            return data;
        },
    });
}
