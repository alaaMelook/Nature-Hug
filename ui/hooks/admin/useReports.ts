"use server";

import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { getAdminStaffPermissions } from "@/lib/admin-helpers";
import { GetUserSalesAnalytics } from "@/domain/use-case/admin/getUserSalesAnalytics";
import type { AccountReportView, ProductSalesReport, ReportSummary } from "@/domain/entities/views/admin/reportViews";

export interface InventoryItem {
    product_id: number;
    variant_id: number | null;
    name: string;
    variant_name: string | null;
    stock: number;
    price: number;
    total_value: number;
}

/**
 * Accounts Performance Report — RBAC scoped:
 * - Admin: sees all staff performance
 * - Staff: sees only their own row
 */
export async function getAccountsReportAction(startDate: string, endDate: string): Promise<AccountReportView[]> {
    try {
        const { customerId, role } = await getAdminStaffPermissions();
        const repo = new IAdminServerRepository();
        const allData = await repo.getAccountsReport(startDate, endDate);

        // Staff only sees their own performance row
        if (role !== 'admin' && customerId) {
            return allData.filter(row => row.customer_id === customerId);
        }

        return allData;
    } catch (error) {
        console.error("Error fetching accounts report:", error);
        return [];
    }
}

/**
 * Product Sales Report — RBAC scoped:
 * - Admin: global product sales
 * - Staff: product sales from their own orders only
 */
export async function getProductSalesReportAction(startDate: string, endDate: string): Promise<ProductSalesReport[]> {
    try {
        const { customerId, role } = await getAdminStaffPermissions();

        if (role === 'admin') {
            // Admin sees global data from RPC
            const repo = new IAdminServerRepository();
            return await repo.getProductSalesReport(startDate, endDate);
        }

        // Staff: compute from their own orders using the analytics use-case
        if (customerId) {
            const analytics = new GetUserSalesAnalytics();
            const topProducts = await analytics.getTopSellingProductsForUser(customerId, startDate, endDate, 100);

            // Calculate total revenue for percentage
            const totalRev = topProducts.reduce((sum, p) => sum + p.total_revenue, 0);

            return topProducts.map(p => ({
                product_id: p.product_id,
                product_name: p.product_name,
                variant_id: p.variant_id ?? undefined,
                variant_name: p.variant_name ?? undefined,
                total_quantity_sold: p.total_quantity,
                total_revenue: p.total_revenue,
                order_count: p.order_count,
                sales_percentage: totalRev > 0 ? Math.round((p.total_revenue / totalRev) * 100) : 0,
            }));
        }

        return [];
    } catch (error) {
        console.error("Error fetching product sales report:", error);
        return [];
    }
}

/**
 * Report Summary — RBAC scoped:
 * - Admin: global summary
 * - Staff: summary from their own orders only
 */
export async function getReportSummaryAction(startDate: string, endDate: string): Promise<ReportSummary> {
    try {
        const { customerId, role } = await getAdminStaffPermissions();

        if (role === 'admin') {
            const repo = new IAdminServerRepository();
            return await repo.getReportSummary(startDate, endDate);
        }

        // Staff: compute summary from their own orders
        if (customerId) {
            const { supabaseAdmin } = await import("@/data/datasources/supabase/admin");

            const { data: orders, error } = await supabaseAdmin.schema('store')
                .from('orders')
                .select('id, grand_total')
                .eq('created_by_customer_id', customerId)
                .gte('created_at', startDate)
                .lte('created_at', endDate + 'T23:59:59')
                .neq('status', 'cancelled');

            if (error) throw error;

            const totalOrders = orders?.length || 0;
            const totalRevenue = (orders || []).reduce((sum, o) => sum + (o.grand_total || 0), 0);

            return {
                total_orders: totalOrders,
                total_revenue: totalRevenue,
                average_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0,
                period_start: new Date(startDate),
                period_end: new Date(endDate),
            };
        }

        return {
            total_orders: 0,
            total_revenue: 0,
            average_order_value: 0,
            period_start: new Date(startDate),
            period_end: new Date(endDate),
        };
    } catch (error) {
        console.error("Error fetching report summary:", error);
        return {
            total_orders: 0,
            total_revenue: 0,
            average_order_value: 0,
            period_start: new Date(startDate),
            period_end: new Date(endDate)
        };
    }
}

export async function getInventoryValuationAction(): Promise<{ items: InventoryItem[], totalValue: number }> {
    try {
        const repo = new IAdminServerRepository();
        const inventoryItems = await repo.getInventoryData();

        const items: InventoryItem[] = [];
        let totalValue = 0;

        for (const item of inventoryItems) {
            if (item.stock > 0) {
                const value = item.stock * item.price;
                items.push({
                    product_id: item.product_id,
                    variant_id: item.variant_id,
                    name: item.name,
                    variant_name: item.variant_name,
                    stock: item.stock,
                    price: item.price,
                    total_value: value
                });
                totalValue += value;
            }
        }

        // Sort by total value descending
        items.sort((a, b) => b.total_value - a.total_value);

        return { items, totalValue };
    } catch (error) {
        console.error("Error fetching inventory valuation:", error);
        return { items: [], totalValue: 0 };
    }
}


