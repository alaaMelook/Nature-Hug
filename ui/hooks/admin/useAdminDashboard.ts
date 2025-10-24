import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardStats } from "@/domain/use-case/admin/getAdminDashboardStats";
import { getRecentOrders } from "@/domain/use-case/admin/orders";


export const useAdminDashboard = () => {
    return useQuery({
        queryKey: ["adminDashboardStats"],
        queryFn: async () => await new getAdminDashboardStats().execute(),
        select: (data) => {
            return {
                ...data,
                products_change: data.products_change ? data.products_change > 0 ? `+${data.products_change}%` : `${data.products_change}%` : '0%',
                orders_change: data.orders_change ? data.orders_change > 0 ? `+${data.orders_change}%` : `${data.orders_change}%` : '0%',
                revenue_change: data.revenue_change ? data.revenue_change > 0 ? `+${data.revenue_change}%` : `${data.revenue_change}%` : '0%',
                customers_change: data.customers_change ? data.customers_change > 0 ? `+${data.customers_change}%` : `${data.customers_change}%` : '0%',
                customers_change_status: data.customers_change > 0 ? "positive" : data.customers_change < 0 ? "negative" : "no-change",
                products_change_status: data.products_change > 0 ? "positive" : data.products_change < 0 ? "negative" : "no-change",
                orders_change_status: data.orders_change > 0 ? "positive" : data.orders_change < 0 ? "negative" : "no-change",
                revenue_change_status: data.revenue_change > 0 ? "positive" : data.revenue_change < 0 ? "negative" : "no-change",
            }
        }

    });
};

export const useRecentOrders = () => {
    return useQuery({
        queryKey: ["adminRecentOrders"],
        queryFn: async () => await new getRecentOrders().execute(),
    });
}
