import React from "react";
import { HomeScreen } from "@/ui/client-screens/(store)/home-screen";
import { DEFAULT_STORE_SETTINGS } from "@/domain/entities/database/settings";


export default async function HomePage({ params }: { params: Promise<{ lang?: string }> }) {
    let lang = (await params).lang as LangKey || 'ar';
    const { ViewRecentProducts } = await import("@/domain/use-case/store/viewRecentProducts");
    const { GetAllCategories } = await import("@/domain/use-case/store/getAllCategories");
    const { GetStoreSettings } = await import("@/domain/use-case/store/getStoreSettings");

    let initialProducts: any[] = [];
    let categories: any[] = [];
    let settings = DEFAULT_STORE_SETTINGS;

    try {
        const [productsRes, categoriesRes, settingsRes] = await Promise.all([
            new ViewRecentProducts(lang).execute(),
            new GetAllCategories(lang).execute(),
            new GetStoreSettings().execute(),
        ]);
        initialProducts = productsRes;
        categories = categoriesRes;
        settings = settingsRes;
    } catch (error) {
        console.error("[HomePage] Failed to fetch data:", error);
        // Return page with fallback data rather than crashing to 404
    }

    return (
        <HomeScreen initialProducts={initialProducts} categories={categories} settings={settings} />
    );
}
