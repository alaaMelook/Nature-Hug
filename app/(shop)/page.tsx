import React from "react";
import HomePageClient from "@/ui/screens/HomePage";
import { viewAllProducts } from "@/domain/use-case/shop/viewAllProducts";


export default async function HomePage() {
  const products = await viewAllProducts();

  return <HomePageClient initialProducts={products} />;
}
