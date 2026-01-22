"use server";

import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
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

export async function getAccountsReportAction(startDate: string, endDate: string): Promise<AccountReportView[]> {
    try {
        const repo = new IAdminServerRepository();
        return await repo.getAccountsReport(startDate, endDate);
    } catch (error) {
        console.error("Error fetching accounts report:", error);
        return [];
    }
}

export async function getProductSalesReportAction(startDate: string, endDate: string): Promise<ProductSalesReport[]> {
    try {
        const repo = new IAdminServerRepository();
        return await repo.getProductSalesReport(startDate, endDate);
    } catch (error) {
        console.error("Error fetching product sales report:", error);
        return [];
    }
}

export async function getReportSummaryAction(startDate: string, endDate: string): Promise<ReportSummary> {
    try {
        const repo = new IAdminServerRepository();
        return await repo.getReportSummary(startDate, endDate);
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

