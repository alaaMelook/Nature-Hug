'use client'


import React, { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { viewProduct } from "@/domain/use-case/shop/viewProduct";
import Skeleton from "@mui/material/Skeleton";
import { useTranslation } from "@/providers/TranslationProvider";
import BuyNowButton from "@/ui/components/(shop)/BuyNowButton";
import AddToCartButton from "@/ui/components/(shop)/CartButton";
import { CollapsibleSection } from "@/ui/components/(shop)/CollapsibleSection";
import Counter from "@/ui/components/(shop)/Counter";
import ImageCarousel from "@/ui/components/(shop)/ImageCarousel";
import { StarRating } from "@/ui/components/(shop)/StarRating";
import { Info, CheckCircle, ShoppingBag, Minus, Star } from "lucide-react";
import { langStore } from '@/lib/i18n/langStore';
import { ReviewsSlider } from "@/ui/components/(shop)/ReviewsSlider";
import Link from "next/link";
import CollapsibleText from "@/ui/components/(shop)/CollapsibleText";


export default function ProductPage({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const resolvedParams = params instanceof Promise ? React.use(params) : params;
  const slug = resolvedParams.slug;
  const [isLoading, setLoading] = useState(true); // local loading tied to lang change

  const { data: product, isFetching, refetch } = useQuery({
    queryKey: ["product", slug, langStore.get()], // include language to auto-refetch
    queryFn: () => viewProduct(slug),

  });

  // Set loading true on language change and refetch
  useEffect(() => {
    if (product) setLoading(false);
  }, [product]);

  // Handle language change
  useEffect(() => {
    const handleLangChange = () => {
      setLoading(true);
      refetch();
    };
    const unsubscribe = langStore.onChange(handleLangChange);
    return () => unsubscribe();
  }, [refetch]);


  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<String | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const toggleSection = useCallback((id: String) => {
    setActiveSection(activeSection === id ? null : id);
  }, [activeSection]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return <div className="p-6 text-center text-red-600">Product not found.</div>;
  }
  console.log(product);
  const sections = [
    { id: 'description', title: 'Full Description', content: product.description, icon: Info },
    {
      id: 'ingredients',
      title: 'Materials/Ingredients',
      content: product.materials && product.materials.length > 0
        ? product.materials.map((material, index) => <p key={index}>{`${material.grams_used}g of ${material.material_name}`}</p>)
        : <p>No materials listed.</p>,
      icon: CheckCircle,
    },
    { id: 'bestfor', title: 'Best For', content: product.highlight, icon: ShoppingBag },
    { id: 'precautions', title: 'Precautions', content: product.description, icon: Minus },
    // {
    //   id: 'reviews',
    //   title: `Customer Reviews`,
    //   icon: Star,
    //   content: (
    //     product.reviews && product.reviews.length > 0 ? (
    //       product.reviews.map(review => (
    //         <div key={review.id} className="p-4 mb-3 border border-gray-100 rounded-lg bg-primary-50 shadow-sm">
    //           <StarRating rating={review.rating} />
    //           <p className="font-semibold text-primary-800 mt-1">{review.customer_name}</p>
    //           <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
    //         </div>
    //       ))
    //     ) : (
    //       <p>No reviews yet. Be the first!</p>
    //     )
    //   ),
    // },
  ];
  console.log(product.variants);
  return (
    <div className={`flex flex-col items-center px-6 p-4 w-full bg-white font-sans`}>
      <div className={`lg:flex lg:space-x-8 max-w-7xl w-full`}>
        <div className="lg:w-1/2 flex flex-col items-center mb-6 lg:mb-0 p-4">
          <div className="w-full max-w-md h-96 relative">
            <ImageCarousel images={[product.image ?? '', ...(product.gallery || [])]} />
          </div>
        </div>

        <div className="lg:w-1/2 flex flex-col justify-start">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-primary-800 mb-2 leading-tight">
            {product.name}
          </h1>
          <label>
            {product.highlight}
          </label>

          <div className="my-3 flex items-center gap-2">
            <StarRating rating={product.avg_rating ?? 0} />
            <span className="text-lg font-semibold text-primary-600">{product.avg_rating?.toFixed(1) ?? 'N/A'}</span>
            <span className="text-sm text-gray-500">
              {` (Based on ${product.reviews?.length ?? 0} reviews)`}
            </span>
          </div>


          <div className="divide-y divide-gray-100">
            {sections.map(section => (
              <CollapsibleSection
                key={section.id}
                id={section.id}
                title={section.title}
                content={section.content}
                icon={section.icon}
                isOpen={activeSection === section.id}
                onToggle={toggleSection}
              />
            ))}
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-between py-3 mb-6">
              <p className="text-4xl font-black text-primary-800">
                {(product.price * quantity)?.toLocaleString() ?? 'N/A'} EGP
              </p>
              <span className={`text-sm font-semibold px-4 py-1.5 rounded-full  ${(product.stock ?? 0) > 3 ? '' :
                (product.stock ?? 0) > 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-md' :
                  'bg-red-100 text-red-700 border border-red-200 shadow-md'
                }`}>
                {(product.stock ?? 0) === 0 ? t('outOfStock') : (product.stock ?? 0) > 3 ? null : `${t('only')} ${product.stock} ${t('leftInStock')}`}
              </span>
              <div className="flex gap-1 ">
                {product.variants?.map(variant => (
                  <Link
                    aria-disabled={variant.slug === product.slug}
                    key={variant.id}
                    href={`/products/${variant.slug}`}
                  >
                    <div className={`border-gray-400 border shadow-lg px-6 py-3 rounded-2xl ${variant.slug === product.slug ? 'bg-gray-600 text-amber-50' : ''}`}>
                      {variant.type}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">

              <div className="flex items-center justify-between text-gray-700">
                <span className="text-lg font-medium">{t('quantity')}:</span>
                <Counter
                  quantity={quantity}
                  onIncrease={() => setQuantity(q => Math.min(q + 1, product.stock ?? 1))}
                  onDecrease={() => setQuantity(q => Math.max(q - 1, 1))}
                />
                {quantity === product.stock && <p className='text-sm text-red-500 font-medium'>{t('maxAvailable')}</p>}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <AddToCartButton product={product} quantity={quantity} />
                <BuyNowButton product={product} quantity={quantity} />
              </div>
              {(product.stock ?? 0) === 0 && (
                <div className="text-center text-red-600 font-semibold mt-2 p-2 bg-red-50 rounded-lg">
                  {t('outOfStock')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="p-3 mt-5 w-full" >

        <ReviewsSlider reviews={product.reviews ?? []} />
      </div>
    </div>
  );

}

function ProductDetailSkeleton() {
  return (
    <div className="flex flex-col items-center px-6 p-4 w-full bg-white font-sans animate-pulse">
      <div className="lg:flex lg:space-x-8 max-w-7xl w-full">
        {/* Image Section Skeleton */}
        <div className="lg:w-1/2 flex flex-col items-center mb-6 lg:mb-0 p-4">
          <Skeleton variant="rounded" width="100%" height={384} className="max-w-md" />
        </div>

        {/* Details Section Skeleton */}
        <div className="lg:w-1/2 flex flex-col justify-start">
          <Skeleton variant="text" width="80%" height={60} />
          <Skeleton variant="text" width="40%" height={30} className="my-3" />

          {/* Collapsible Sections Skeleton */}
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="py-4">
                <Skeleton variant="text" width="60%" height={24} />
              </div>
            ))}
          </div>

          {/* Price and Stock Skeleton */}
          <div className="pt-4">
            <div className="flex items-center justify-between py-3 mb-6">
              <Skeleton variant="text" width="40%" height={50} />
              <Skeleton variant="rounded" width="30%" height={30} />
            </div>

            {/* Actions Skeleton */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Skeleton variant="text" width="20%" height={30} />
                <Skeleton variant="rounded" width="30%" height={40} />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Skeleton variant="rounded" width="100%" height={48} />
                <Skeleton variant="rounded" width="100%" height={48} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
