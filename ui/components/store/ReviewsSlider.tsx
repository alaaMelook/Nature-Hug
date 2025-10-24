'use client'

import React from 'react'
import { ProductDetailView, ProductReviewView as Review } from '@/domain/entities/views/shop/productDetailView'
import { StarRating } from './StarRating'
import useEmblaCarousel from 'embla-carousel-react'
import { AddReview } from './addReview'


export function ReviewsSlider({ product }: Readonly<{ product: ProductDetailView }>) {
  const [emblaRef] = useEmblaCarousel({ loop: true })

  return (
    <div className="relative w-full mx-auto bg-opacity-50 backdrop-blur-3xl py-20">
      <div
        className="overflow-hidden w-full"
        ref={emblaRef}
      >
        <div className="flex w-full mx-10">
          {product.reviews.map(review => (
            <div
              key={review.id}
              className="flex-none w-full sm:w-80 p-4 ml-4 mb-3 border border-gray-100 rounded-lg bg-primary-50 shadow-sm"
            >
              <StarRating rating={review.rating} />
              <p className="font-semibold text-primary-800 mt-1">{review.customer_name}</p>
              <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
            </div>
          ))}
        </div>
        <div className='flex justify-center'>
          <AddReview product={product} onReviewAdded={() => { }} />

        </div>


      </div>
    </div>
  )
}
