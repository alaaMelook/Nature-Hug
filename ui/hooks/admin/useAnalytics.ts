"use server";

import { GetUserSalesAnalytics, TopSellingProduct, UserSalesBreakdown } from "@/domain/use-case/admin/getUserSalesAnalytics";
import { getAdminStaffPermissions } from "@/lib/admin-helpers";

const analytics = new GetUserSalesAnalytics();

/**
 * Get top selling products — scoped by role:
 * - Admin: global top sellers
 * - Staff: only their own orders' top sellers
 */
export async function getTopSellingProductsAction(
    startDate: string,
    endDate: string,
    limit: number = 10
): Promise<TopSellingProduct[]> {
    try {
        const { customerId, role } = await getAdminStaffPermissions();

        if (role === 'admin') {
            return await analytics.getGlobalTopSellingProducts(startDate, endDate, limit);
        } else if (customerId) {
            return await analytics.getTopSellingProductsForUser(customerId, startDate, endDate, limit);
        }
        return [];
    } catch (error) {
        console.error("[getTopSellingProductsAction] Error:", error);
        return [];
    }
}

/**
 * Admin only: Get top-selling products breakdown per user
 */
export async function getTopSellingProductsPerUserAction(
    startDate: string,
    endDate: string
): Promise<UserSalesBreakdown[]> {
    try {
        const { role } = await getAdminStaffPermissions();
        if (role !== 'admin') return [];

        return await analytics.getTopSellingProductsPerUser(startDate, endDate);
    } catch (error) {
        console.error("[getTopSellingProductsPerUserAction] Error:", error);
        return [];
    }
}
