"use client";
import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";

import Link from "next/link";
import {
  useFeatures,
  useTranslation,
} from "@/app/components/TranslationProvider";
import AddToCartButton from "./components/CartButton";

interface Product {
  id: number;
  created_at: string;
  name_english: string | null;
  name_arabic: string | null;
  description_english: string | null;
  description_arabic: string | null;
  price: number;
  discount: number | null;
  quantity: number | null;
  image_url: string | null;
}

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useTranslation();
  const features = useFeatures();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products?lang=${language}`);
        const { success, products, error } = await res.json();

        if (!success) throw new Error(error);
        setProducts(products);
      } catch (err: any) {
        setError(err.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [language]);

  const renderProductContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto">
          <p className="font-semibold">{t("error")}:</p>
          <p>{error}</p>
        </div>
      );
    }
    if (products.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg">{t("noProd")}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const displayName =
            language === "ar" ? product.name_arabic : product.name_english;
          return (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={displayName || ""}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x400/D1D5DB/4B5563?text=Image+Not+Found";
                    }}
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">{t("noImg")}</span>
                  </div>
                )}
                {product.discount ? (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    -{product.discount}%
                  </div>
                ) : null}
              </div>
              <div className="p-5">
                <h3
                  className={`text-lg text-default mb-2 ${
                    language === "ar" ? "font-weight-800" : "font-weight-500"
                  }`}
                >
                  {displayName}
                </h3>

                <div className="flex items-center mb-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">(4.5)</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-semibold text-gray-900">
                    {product.price.toFixed(2)} EGP
                  </p>
                  {(product.quantity == null || product.quantity == 0) && (
                    <span className="text-sm text-gray-500">
                      {t("outOfStock")}
                    </span>
                  )}
                </div>
                <AddToCartButton productId={product.id} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 antialiased text-gray-800">
      <main>
        {/* Hero Section */}
        <section className="bg-white py-12 md:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl text-default leading-tight font-weight-400">
              {t("heroTitle")}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              {t("heroDescription")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/cart"
                className="bg-[#8B4513] text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-[#A0522D] transition-colors duration-300 text-center"
              >
                {t("shopNow")}
              </Link>
              <Link
                href="/checkout"
                className="bg-[#8B4513] text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-[#A0522D] transition-colors duration-300 text-center"
              >
                {t("learnMore")}
              </Link>
            </div>
          </div>
        </section>

        {/* Product Grid Section */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-default font-weight-600">
              {t("featuredProducts")}
            </h2>
            {renderProductContent()}
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-100 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {features.map(
                (feature: {
                  title: string;
                  icon: any;
                  description: string;
                }) => (
                  <div
                    key={feature.title}
                    className="bg-white p-6 rounded-xl transform transition-transform duration-300 hover:scale-105 text-primary font-weight-400 text-center shadow-md"
                  >
                    <div className="flex justify-center mb-4">
                      <feature.icon className="w-10 h-10 text-[#8B4513]" />
                    </div>
                    <h3
                      className={`text-lg ${
                        language === "ar"
                          ? "font-weight-900"
                          : "font-weight-500"
                      } text-default `}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`text-gray-800 text-sm ${
                        language === "ar"
                          ? "font-weight-600"
                          : "font-weight-400"
                      }`}
                    >
                      {feature.description}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white font-semibold text-gray-700 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm md:text-base">
            &copy; {new Date().getFullYear()} Hug Nature.{" "}
            {t("allRightsReserved")}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
