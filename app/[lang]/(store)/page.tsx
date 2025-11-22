import React from "react";
import { ViewRecentProducts } from "@/domain/use-case/shop/viewRecentProducts";
import { HomeScreen } from "@/ui/client-screens/(store)/home-screen";


export default async function HomePage({ params }: { params: { lang?: string } }) {
    let lang = params.lang as LangKey || 'ar';
    let initialProducts = await new ViewRecentProducts(lang).execute();

    return (
        <HomeScreen initialProducts={initialProducts} />
    );

}
