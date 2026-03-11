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

    let report: { totalSales: number; orderCount: number; customerCount: number; topProducts: { name: string; quantity: number; revenue: number }[]; topStaff: { name: string; orderCount: number; totalSales: number }[]; paymentBreakdown: { method: string; count: number; total: number }[] } = { totalSales: 0, orderCount: 0, customerCount: 0, topProducts: [], topStaff: [], paymentBreakdown: [] };
    let orders: any[] = [];
    let products: any[] = [];
    let promoCodes: any[] = [];

    // Check if current user is POS-only staff (uses cached function)
    const { customerId, permissions } = await getAdminStaffPermissions();
    const isPosOnly = permissions.length > 0
        && permissions.includes('bazaars.pos')
        && !permissions.includes('bazaars');

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

    try {
        orders = await bazaarsUc.getOrders(bazaarId);
    } catch (error) {
        console.error("[BazaarDetailPage] Error loading orders:", error);
    }

    return (
        <BazaarDetailScreen
            bazaar={bazaar}
            report={report}
            orders={orders}
            products={products}
            promoCodes={promoCodes.filter((p: any) => p.bazaar_id === bazaarId || !p.bazaar_only || (p.bazaar_only && !p.bazaar_id))}
            isPosOnly={isPosOnly}
            currentUserId={customerId}
        />
    );
}
