'use client'

import React, { useState, useEffect } from 'react'
import { ProductDetailView, ProductReviewView } from '@/domain/entities/views/shop/productDetailView'
import { StarRating } from './StarRating'
import useEmblaCarousel from 'embla-carousel-react'
import { AddReview } from './addReview'
import { useTranslation } from "react-i18next";
import Image from 'next/image';
import { getReviewImages } from '@/lib/services/reviewImageService';


export function ReviewsSlider({ product }: { product: ProductDetailView }) {
    const [emblaRef] = useEmblaCarousel({ loop: true })
    const { t } = useTranslation()

    // State to hold images for each review
    const [reviewImages, setReviewImages] = useState<{ [reviewId: number]: string[] }>({});
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Fetch images for all reviews
    useEffect(() => {
        const fetchImages = async () => {
            const imagesMap: { [reviewId: number]: string[] } = {};
            for (const review of product.reviews) {
                try {
                    const images = await getReviewImages(review.id);
                    if (images.length > 0) {
                        imagesMap[review.id] = images;
                    }
                } catch (error) {
                    console.error(`Failed to fetch images for review ${review.id}:`, error);
                }
            }
            setReviewImages(imagesMap);
        };

        if (product.reviews.length > 0) {
            fetchImages();
        }
    }, [product.reviews]);

    // Filter out rejected reviews - only show pending and approved
    // If status is undefined, show the review (backwards compatibility)
    const visibleReviews = product.reviews.filter(r => !r.status || r.status !== 'rejected');

    return (
        <div className="relative w-full mx-auto bg-opacity-50 backdrop-blur-3xl ">
            {visibleReviews.length === 0 && (<div className='text-center pb-5'>{t('noReviews')}</div>)}
            <div
                className="overflow-hidden w-full"
                ref={emblaRef}
            >
                <div className="flex w-full mx-10">
                    {visibleReviews.length !== 0 && (visibleReviews.map(review => (
                        <div
                            key={review.id}
                            className="flex-none w-full sm:w-80 p-4 ml-4 mb-3 border border-gray-100 rounded-lg bg-primary-50 shadow-sm relative"
                        >
                            <StarRating rating={review.rating} />
                            <p className="font-semibold text-primary-800 mt-1">{review.customer_name}-{review.customer_governorate}</p>
                            <p className="text-sm text-gray-600 mt-1">{review.comment}</p>

                            {/* Review Images */}
                            {reviewImages[review.id] && reviewImages[review.id].length > 0 && (
                                <div className="flex gap-2 mt-3 flex-wrap">
                                    {reviewImages[review.id].map((imageUrl, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(imageUrl)}
                                            className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:border-primary-500 transition-colors"
                                        >
                                            <Image
                                                src={imageUrl}
                                                alt={`Review image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )))
                    }
                </div>
                <div className='flex justify-center'>
                    <AddReview product={product} />
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
                        <Image
                            src={selectedImage}
                            alt="Review image"
                            fill
                            className="object-contain"
                        />
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
