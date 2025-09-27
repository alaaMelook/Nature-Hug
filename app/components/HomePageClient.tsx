"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useFeatures, useTranslation } from "@/app/components/TranslationProvider";
import AddToCartButton from "./CartButton";

interface HomePageClientProps {
  initialProducts: Product[];
}

const HomePageClient = ({ initialProducts }: HomePageClientProps) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useTranslation();
  const features = useFeatures();

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
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transform transition-transform duration-300 hover:scale-105"
            >
              {/* Image container with an aspect ratio for consistent sizing */}
              <div className="relative aspect-w-4 aspect-h-3">
                <img
                  src={product.image_url || undefined}
                  alt={displayName || "Product image"}
                  className="w-full h-80 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/400x400/D1D5DB/4B5563?text=Image+Not+Found";
                  }}
                />

                {/* Discount badge, positioned in the top-left */}
                {!product.discount ? (
                  <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                    -20%
                  </div>
                ) : null}
                {(product.stock == null || product.stock == 0) && (
                  <div className="absolute top-3 right-3 bg-neutral-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                    {t("outOfStock")}
                  </div>
                )}
              </div>

              {/* Product details and button container */}
              <div className="p-5 flex flex-col justify-between flex-grow">
                <div>
                  {/* Product name with improved typography */}
                  <h3
                    className={`text-xl font-semibold text-gray-800 mb-5 flex`}
                  >
                    {displayName}
                  </h3>

                  {/* Price and stock status container */}
                  <div className="flex items-center content-center mb-2 ">
                    {product.discount ? (
                      <p className="text-lg font-normal text-primary-900">
                        {product.price.toFixed(2)} EGP
                      </p>
                    ) : (
                      <div className="flex flex-col items-baseline space-x-2">
                        <p className="text-md font-medium text-primary-900">
                          {(product.price * (1 - 20 / 100)).toFixed(2)} EGP
                        </p>
                        <p className="text-lg text-gray-500 line-through">
                          {product.price.toFixed(2)} EGP
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Add to Cart button */}
                <AddToCartButton product={product} />
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
        <section className="bg-primary-100 py-12 md:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl text-default leading-tight ">
              {t("heroTitle")}
            </h1>
            <p className="sm:text-lg text-primary-800 max-w-2xl mx-auto mb-8">
              {t("heroDescription")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/cart"
                className="bg-primary-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-primary-50 hover:text-primary-700 transition-colors duration-300 text-center"
              >
                {t("shopNow")}
              </Link>
              <Link
                href="/checkout"
                className="bg-primary-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-primary-50 hover:text-primary-700  transition-colors duration-300 text-center"
              >
                {t("learnMore")}
              </Link>
            </div>
          </div>
        </section>

        {/* Product Grid Section */}
        <section className="bg-primary-50 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-default ">
              {t("featuredProducts")}
            </h2>
            {renderProductContent()}
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-primary-100 py-12 md:py-16">
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
                    className="bg-white p-6 rounded-xl transform transition-transform duration-300 hover:scale-105 text-primary  text-center shadow-md"
                  >
                    <div className="flex justify-center mb-4">
                      <feature.icon className="w-10 h-10 text-[#8B4513]" />
                    </div>
                    <h3 className={`text-lg text-default `}>{feature.title}</h3>
                    <p className={`text-gray-800 text-sm`}>
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
      <footer className=" bg-primary-50 font-semibold text-gray-700 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm md:text-base" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Hug Nature.{" "}
            {t("allRightsReserved")}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePageClient;
