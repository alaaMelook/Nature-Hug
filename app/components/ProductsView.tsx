'use client';

import React from "react";
import BuyNowButton from "./BuyNowButton";
import AddToCartButton from "./CartButton";
import { useTranslation } from "./TranslationProvider";
import Link from "next/link";
import { queryObjects } from "node:v8";

function ProductCard({
  product,
  language,
  t,
}: {
  product: Product;
  language: string;
  t: (key: string) => string;
}) {
  const displayName =
    language === "ar" ? product.name_arabic : product.name_english;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transform transition-transform duration-300 hover:scale-105">
      {/* Image wrapped in Link */}
      <Link
        href={`/products/${product.id}`}
        className="relative aspect-w-4 aspect-h-3 block"
      >
        <img
          src={product.image_url || undefined}
          alt={displayName || "Product image"}
          className="w-full h-80 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/400x400/D1D5DB/4B5563?text=Image+Not+Found";
          }}
        />

        {/* Discount badge */}
        {product.discount != null && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
            -{product.discount} EGP
          </div>
        )}

        {/* Out of stock badge */}
        {(product.stock == null || product.stock === 0) && (
          <div className="absolute top-3 right-3 bg-neutral-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
            {t("outOfStock")}
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="p-5 flex flex-col justify-between flex-grow">
        <div>
          {/* Title wrapped in Link */}
          <Link href={`/products/${product.id}`}>
            <h3 className="text-xl font-semibold text-gray-800 mb-5">
              {displayName}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-center content-center mb-2">
            {!product.discount ? (
              <p className="text-lg font-normal text-primary-900">
                {product.price.toFixed(2)} EGP
              </p>
            ) : (
              <div className="flex flex-col items-baseline space-x-2">
                <p className="text-md font-medium text-primary-900">
                  {product.price - product.discount} EGP
                </p>
                <p className="text-lg text-gray-500 line-through">
                  {product.price.toFixed(2)} EGP
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Actions (NOT wrapped in Link) */}
        <div className="mt-4 space-y-2">
          <AddToCartButton product={product} quantity={1} />
          {product.stock > 0 && <BuyNowButton product={product} quantity={1} />}
        </div>
      </div>
    </div>
  );
}

export default function ProductView({
  loading,
  error,
  products,
}: Readonly<{
  loading: boolean;
  error: string | null;
  products: Product[];
}>) {
  const { language, t } = useTranslation();

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
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          language={language}
          t={t}
        />
      ))}
    </div>
  );
}
