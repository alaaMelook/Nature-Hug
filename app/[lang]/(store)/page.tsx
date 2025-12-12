import React from "react";
import { ViewRecentProducts } from "@/domain/use-case/store/viewRecentProducts";
import { HomeScreen } from "@/ui/client-screens/(store)/home-screen";


export default async function HomePage({ params }: { params: Promise<{ lang?: string }> }) {
    let lang = (await params).lang as LangKey || 'ar';
    const { ViewRecentProducts } = await import("@/domain/use-case/store/viewRecentProducts");
    const { GetAllCategories } = await import("@/domain/use-case/store/getAllCategories");

    const [initialProducts, categories] = await Promise.all([
        new ViewRecentProducts(lang).execute(),
        new GetAllCategories(lang).execute()
    ]);

    return (
        <HomeScreen initialProducts={initialProducts} categories={categories} />
    );
}
