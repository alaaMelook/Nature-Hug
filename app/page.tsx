import React from "react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import HomePageClient from "./server-pages/HomePage";

// Server component for initial data fetching
async function getProducts(language: string = "en") {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }

    const formatted = (data || []).map((p: any) => ({
      ...p,
      name: language === "en" ? p.name_english : p.name_arabic,
      description: language === "en" ? p.description_english : p.description_arabic,
      id: Number(p.id),
      price: Number(p.price) || 0,
      discount: p.discount != null ? Number(p.discount) : null,
      quantity: p.quantity != null ? Number(p.quantity) : null,
    }));

    return formatted;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  return <HomePageClient initialProducts={products} />;
}
