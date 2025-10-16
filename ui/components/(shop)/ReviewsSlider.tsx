'use client'

import React from 'react'
import { ProductReviewView as Review } from '@/domain/entities/views/shop/productDetailView'
import { StarRating } from './StarRating'
import useEmblaCarousel from 'embla-carousel-react'

interface ReviewsSliderProps {
  reviews: Review[]
}

export const ReviewsSlider: React.FC<ReviewsSliderProps> = ({ reviews }) => {
  const [emblaRef] = useEmblaCarousel({ loop: true })

  return (
    <div className="relative w-full mx-auto">
      <div
        className="overflow-hidden"
        ref={emblaRef}
      >
        <div className="flex ml-4">
          {reviews.map(review => (
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
      </div>
    </div>
  )
}
