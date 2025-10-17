'use client';

import React, { useState, useMemo } from "react";
import BuyNowButton from "./BuyNowButton";
import AddToCartButton from "./CartButton";
import { useTranslation } from "../../../providers/TranslationProvider";
import { useRouter } from "next/navigation";
import { ProductView } from "@/domain/entities/views/shop/productView";
import Skeleton from "@mui/material/Skeleton";
import { StarRating } from "./StarRating";

function ProductCard({
  product,
  t,
  compact = false,
}: {
  product: ProductView;
  t: (key: string) => string;
  compact?: boolean;
}) {
  const router = useRouter();

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transform transition-transform duration-300 hover:scale-105 cursor-pointer ${compact ? "p-3" : ""
        }`}
      onClick={() => router.push(`/products/${product.slug}`)}
    >
      <div className={`relative ${compact ? "aspect-[4/3]" : "aspect-w-4 aspect-h-3"} block`}>
        <img
          src={product.image || undefined}
          alt={product.name || "Product image"}
          className={`w-full ${compact ? "h-40" : "h-50"} object-cover align-middle`}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/400x400/D1D5DB/4B5563?text=Image+Not+Found";
          }}
        />

        {product.discount != null && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
            -{product.discount} EGP
          </div>
        )}

        {(product.stock == null || product.stock === 0) && (
          <div className="absolute top-3 right-3 bg-neutral-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
            {t("outOfStock")}
          </div>
        )}
      </div>

      <div className={`p-${compact ? "3" : "5"} flex flex-col justify-between flex-grow`}>
        <div>
          <div className="flex items-center justify-between">
            <h3
              className={`${compact ? "text-lg mb-2" : "text-xl mb-5"
                } font-semibold text-gray-800`}
            >
              {product.name}
            </h3>
            <StarRating rating={product.avg_rating} />
          </div>

          <div className="flex items-center content-center mb-2">
            {!product.discount ? (
              <p className={`${compact ? "text-md" : "text-lg"} font-normal text-primary-900`}>
                {product.price.toFixed(2)} EGP
              </p>
            ) : (
              <div className="flex flex-col items-baseline">
                <p className={`${compact ? "text-sm" : "text-md"} font-medium text-primary-900`}>
                  {(product.price - product.discount).toFixed(2)} EGP
                </p>
                <p className={`${compact ? "text-sm" : "text-lg"} text-gray-500 line-through`}>
                  {product.price.toFixed(2)} EGP
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
          <AddToCartButton product={product} quantity={1} />
          {product.stock != null && product.stock > 0 && (
            <BuyNowButton product={product} quantity={1} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({
  products,
  isLoading,
  perPage = 6,
  recent = false,
}: Readonly<{
  isLoading: boolean;
  products?: ProductView[];
  perPage?: number;
  recent?: boolean;
}>) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const totalPages = useMemo(() => {
    if (!products?.length) return 1;
    return Math.ceil(products.length / perPage);
  }, [products, perPage]);

  // 🔹 If 'recent' is on → show all, else paginate
  const visibleProducts = useMemo(() => {
    if (!products) return [];
    if (recent) return products;
    const start = (page - 1) * perPage;
    return products.slice(start, start + perPage);
  }, [products, page, perPage, recent]);

  const goToPage = (num: number) => {
    if (num >= 1 && num <= totalPages) setPage(num);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const skeletonWidth = 283.6;
  const skeletonHeight = 460;
  const skeletonAnimation = "wave";
  const variant = "rounded";

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(perPage)].map((_, i) => (
            <Skeleton
              key={i}
              variant={variant}
              width={skeletonWidth}
              height={skeletonHeight}
              animation={skeletonAnimation}
            />
          ))}
        </div>
      ) : (products?.length ?? 0) > 0 ? (
        <>
          <div
            className={`grid ${recent
              ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
              } gap-6`}
          >
            {visibleProducts.map((product) => (
              <ProductCard key={product.slug} product={product} t={t} compact={!recent} />
            ))}
          </div>

          {/* Pagination Controls — hidden when recent */}
          {!recent && totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg border ${page === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100 border-gray-300"
                  }`}
              >
                {t("prev") || "Prev"}
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNumber = i + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={`px-4 py-2 rounded-lg border ${page === pageNumber
                      ? "bg-primary-600 text-white border-primary-600"
                      : "text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-lg border ${page === totalPages
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100 border-gray-300"
                  }`}
              >
                {t("next") || "Next"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg">{t("noProd")}</p>
        </div>
      )}
    </>
  );
}
