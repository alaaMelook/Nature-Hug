import React from "react";
import { Bazaars } from "@/domain/use-case/admin/bazaars";
import BazaarDetailScreen from "@/ui/client-screens/admin/bazaar-detail-screen";
import { IProductServerRepository } from "@/data/repositories/server/iProductsRepository";
import { GetAllPromoCodes } from "@/domain/use-case/admin/promo-codes/getAllPromoCodes";
import { redirect } from "next/navigation";
import { getAdminStaffPermissions } from "@/lib/admin-helpers";

export default async function BazaarDetailPage({ params }: { params: Promise<{ id: string; lang: string }> }) {
    const { id, lang } = await params;
    const bazaarId = parseInt(id);
    const bazaarsUc = new Bazaars();

    const bazaar = await bazaarsUc.getById(bazaarId);
    if (!bazaar) redirect("/admin/bazaars");

    let report: {
        totalSales: number; orderCount: number; customerCount: number;
        allProducts: { name: string; product_id: number; variant_id: number | null; quantity: number; revenue: number; cost: number; remaining_stock: number }[];
        topStaff: { name: string; orderCount: number; totalSales: number }[];
        paymentBreakdown: { method: string; count: number; total: number }[];
        financialSummary: {
            grossRevenue: number; totalProductCost: number; totalExpenses: number;
            netProfit: number; profitMargin: number; expenses: any[];
        };
    } = {
        totalSales: 0, orderCount: 0, customerCount: 0, allProducts: [], topStaff: [], paymentBreakdown: [],
        financialSummary: { grossRevenue: 0, totalProductCost: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0, expenses: [] },
    };
    let myReport: typeof report | null = null;
    let orders: any[] = [];
    let products: any[] = [];
    let promoCodes: any[] = [];

    // Check if current user is POS-only staff (uses cached function)
    const { customerId, permissions, role } = await getAdminStaffPermissions();
    const isPosOnly = permissions.length > 0
        && permissions.includes('bazaars.pos')
        && !permissions.includes('bazaars');
    const isAdmin = role === 'admin';

    // Load products and promo codes
    try {
        [products, promoCodes] = await Promise.all([
            new IProductServerRepository(lang as any).viewAll(),
            new GetAllPromoCodes().execute(),
        ]);
    } catch (error) {
        console.error("[BazaarDetailPage] Error loading products/promos:", error);
    }

    // Load bazaar-specific data
    if (!isPosOnly) {
        try {
            report = await bazaarsUc.getReport(bazaarId);
        } catch (error) {
            console.error("[BazaarDetailPage] Error loading report:", error);
        }
    }

    // Load personal report for non-admin staff
    if (!isAdmin && customerId) {
        try {
            myReport = await bazaarsUc.getReport(bazaarId, customerId);
        } catch (error) {
            console.error("[BazaarDetailPage] Error loading personal report:", error);
        }
    }

    try {
        orders = await bazaarsUc.getOrders(bazaarId);
    } catch (error) {
        console.error("[BazaarDetailPage] Error loading orders:", error);
    }

    return (
        <BazaarDetailScreen
            bazaar={bazaar}
            report={report}
            myReport={myReport}
            orders={orders}
            products={products}
            promoCodes={promoCodes.filter((p: any) => {
                if (!p.bazaar_only) return true; // not bazaar-only = always include
                const ids: number[] = p.bazaar_ids?.length ? p.bazaar_ids : (p.bazaar_id ? [p.bazaar_id] : []);
                return ids.length === 0 || ids.includes(bazaarId); // empty = all bazaars, or must include this bazaar
            })}
            isPosOnly={isPosOnly}
            currentUserId={customerId}
            userRole={role}
        />
    );
}
