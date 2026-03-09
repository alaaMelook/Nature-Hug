import React from "react";
import { Bazaars } from "@/domain/use-case/admin/bazaars";
import BazaarDetailScreen from "@/ui/client-screens/admin/bazaar-detail-screen";
import { IProductServerRepository } from "@/data/repositories/server/iProductsRepository";
import { GetAllPromoCodes } from "@/domain/use-case/admin/promo-codes/getAllPromoCodes";
import { redirect } from "next/navigation";

export default async function BazaarDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const bazaarId = parseInt(id);
    const bazaarsUc = new Bazaars();

    const bazaar = await bazaarsUc.getById(bazaarId);
    if (!bazaar) redirect("/admin/bazaars");

    let report: { totalSales: number; orderCount: number; customerCount: number; topProducts: { name: string; quantity: number; revenue: number }[]; topStaff: { name: string; orderCount: number; totalSales: number }[]; paymentBreakdown: { method: string; count: number; total: number }[] } = { totalSales: 0, orderCount: 0, customerCount: 0, topProducts: [], topStaff: [], paymentBreakdown: [] };
    let orders: any[] = [];
    let products: any[] = [];
    let promoCodes: any[] = [];

    // Load products and promo codes (these always work)
    try {
        [products, promoCodes] = await Promise.all([
            new IProductServerRepository().viewAll(),
            new GetAllPromoCodes().execute(),
        ]);
    } catch (error) {
        console.error("[BazaarDetailPage] Error loading products/promos:", error);
    }

    // Load bazaar-specific data (requires migration)
    try {
        report = await bazaarsUc.getReport(bazaarId);
        console.log("[BazaarDetailPage] Report loaded:", JSON.stringify(report));
    } catch (error) {
        console.error("[BazaarDetailPage] Error loading report:", error);
    }

    try {
        orders = await bazaarsUc.getOrders(bazaarId);
        console.log("[BazaarDetailPage] Orders loaded:", orders.length, "orders");
    } catch (error) {
        console.error("[BazaarDetailPage] Error loading orders:", error);
    }

    return (
        <BazaarDetailScreen
            bazaar={bazaar}
            report={report}
            orders={orders}
            products={products}
            promoCodes={promoCodes.filter((p: any) => p.bazaar_id === bazaarId || !p.bazaar_only)}
        />
    );
}
