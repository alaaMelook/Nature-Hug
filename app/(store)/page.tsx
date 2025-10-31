import React from "react";
import {ViewRecentProducts} from "@/domain/use-case/shop/viewRecentProducts";
import {HomeScreen} from "@/ui/client-screens/(store)/home-screen";


export default async function HomePage() {


    let initialProducts = await new ViewRecentProducts().execute();

    return (
        <HomeScreen initialProducts={initialProducts}/>
    );

}
