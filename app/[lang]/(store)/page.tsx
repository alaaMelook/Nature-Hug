import React from "react";
import { HomeScreen } from "@/ui/client-screens/(store)/home-screen";


export default async function HomePage({ params }: { params: Promise<{ lang?: string }> }) {
    let lang = (await params).lang as LangKey || 'ar';
    const { ViewRecentProducts } = await import("@/domain/use-case/store/viewRecentProducts");
    const { GetAllCategories } = await import("@/domain/use-case/store/getAllCategories");

    let initialProducts: any[] = [];
    let categories: any[] = [];

    try {
        [initialProducts, categories] = await Promise.all([
            new ViewRecentProducts(lang).execute(),
            new GetAllCategories(lang).execute()
        ]);
    } catch (error) {
        console.error("[HomePage] Failed to fetch data:", error);
        // Return page with empty data rather than crashing to 404
    }

    return (
        <HomeScreen initialProducts={initialProducts} categories={categories} />
    );
}
