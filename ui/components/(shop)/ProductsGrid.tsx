'use client';

import React from "react";
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
}: {
  product: ProductView;
  t: (key: string) => string;
}) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/products/${product.slug}`);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transform transition-transform duration-300 hover:scale-105 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative aspect-w-4 aspect-h-3 block">
        <img
          src={product.image || undefined}
          alt={product.name || "Product image"}
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
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 mb-5">
              {product.name}
            </h3>
            <StarRating rating={product.avg_rating} />
          </div>

          {/* Price */}
          <div className="flex items-center content-center mb-2">
            {!product.discount ? (
              <p className="text-lg font-normal text-primary-900">
                {product.price.toFixed(2)} EGP
              </p>
            ) : (
              <div className="flex flex-col items-baseline space-x-2">
                <p className="text-md font-medium text-primary-900">
                  {(product.price - product.discount).toFixed(2)} EGP
                </p>
                <p className="text-lg text-gray-500 line-through">
                  {product.price.toFixed(2)} EGP
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Actions */}
        <div
          className="mt-4 space-y-2"
          onClick={(e) => e.stopPropagation()}
        >
          <AddToCartButton product={product} quantity={1} />
          {product.stock != null && product.stock > 0 && <BuyNowButton product={product} quantity={1} />}
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({
  products,
  isLoading,
}: Readonly<{
  isLoading: boolean;
  products?: ProductView[];
}>) {
  const { t } = useTranslation();
  const skeletonWidth = 283.6;
  const skeletonHeight = 604;
  const skeletonAnimation = "wave";
  const variant = 'rounded'
  if (!isLoading && (products == null || products.length == 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 text-lg">{t("noProd")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

      {isLoading ? (
        <>
          <Skeleton variant={variant} width={skeletonWidth} height={skeletonHeight} animation={skeletonAnimation} />
          <Skeleton variant={variant} width={skeletonWidth} height={skeletonHeight} animation={skeletonAnimation} />
          <Skeleton variant={variant} width={skeletonWidth} height={skeletonHeight} animation={skeletonAnimation} />
          <Skeleton variant={variant} width={skeletonWidth} height={skeletonHeight} animation={skeletonAnimation} />
        </>

      ) :

        products?.map((product) => (
          <ProductCard
            key={product.slug}
            product={product}
            t={t}
          />
        ))

      }
    </div>
  );
}
