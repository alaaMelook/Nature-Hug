'use client'

import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { useTranslation } from '@/ui/providers/TranslationProvider'
import { useSupabaseAuth } from '@/ui/providers/SupabaseAuthProvider'
import { toast } from 'sonner'
import { AddProductReview } from '@/domain/use-case/shop/addProductReview'
import { ProductDetailView } from '@/domain/entities/views/shop/productDetailView'
import { ProductView } from '@/domain/entities/views/shop/productView'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Review } from '@/domain/entities/database/review'
import { addReview } from '@/ui/hooks/store/useAddReview'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react' // Import icons for expansion

interface AddReviewProps {
    product: ProductView | ProductDetailView,
    onReviewAdded: () => void
}

export const AddReview: React.FC<AddReviewProps> = ({ product, onReviewAdded }) => {
    const { t } = useTranslation()
    const { user, loading: authLoading } = useSupabaseAuth()
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [hoverRating, setHoverRating] = useState(0)
    const [isExpanded, setIsExpanded] = useState(false) // New state for expand/collapse
    const queryClient = useQueryClient();

    const onAdded = () => {
        toast.success(t('reviewAddedSuccessfully'))
        setRating(0)
        setComment('')
        setIsExpanded(false); // Collapse the form after successful submission
        onReviewAdded()
        queryClient.invalidateQueries({ queryKey: ["reviews", product.slug] });
    }
    const onError = (error: any) => {
        console.error('Failed to add review:', error)
        toast.error(t('failedToAddReview'))
    }

    const mutation =
        addReview({
            onSuccess: onAdded,
            onError: onError
        })

    const handleStarClick = (index: number) => {
        setRating(index + 1)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            toast.error(t('loginToAddReview'))
            return
        }
        if (rating === 0) {
            toast.error(t('pleaseSelectRating'))
            return
        }
        if (!comment.trim()) {
            toast.error(t('pleaseEnterComment'))
            return
        }

        try {
            const review: Review = {
                id: 0,
                product_id: product.id,
                customer_id: user.id,
                rating: rating,
                comment: comment,
                status: 'pending',
                created_at: ''
            };
            mutation.mutate(review)
        } catch (error) {
            console.error('Failed to add review:', error)
            toast.error(t('failedToAddReview'))
        }
    }

    if (authLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <p>{t('loading')}...</p>
            </div>
        )
    }

    // Toggle function
    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="my-10 mx-40 w-1/2">
            {/* The Expand/Collapse Button */}
            <button
                onClick={toggleExpansion}
                className="w-full flex items-center justify-between px-6 py-4 bg-primary-800 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-primary-300"
            >
                <span className="text-xl font-semibold">{t('addYourReview')}</span>
                {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>

            {/* The Review Form Content, shown only when isExpanded is true */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-screen pt-6' : 'max-h-0'}`}>
                <div className={`relative ${!user ? 'bg-gray-300' : "bg-white"} p-6 rounded-lg shadow-md border border-gray-100`}>

                    <div className={`${!user ? 'filter blur-sm' : ''}`}>
                        <h3 className="text-2xl font-bold text-primary-800 mb-4">{t('addYourReview')}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('yourRating')}
                                </label>
                                <div className="flex items-center space-x-1">
                                    {[...Array(5)].map((_, index) => (
                                        <Star
                                            key={index}
                                            size={28}
                                            className={`cursor-pointer transition-colors duration-200 ${index < (hoverRating || rating)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                            onClick={() => handleStarClick(index)}
                                            onMouseEnter={() => setHoverRating(index + 1)}
                                            onMouseLeave={() => setHoverRating(0)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('yourComment')}
                                </label>
                                <textarea
                                    id="comment"
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-b"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder={t('writeYourReviewHere')}
                                />
                            </div>
                            <div className="text-right">
                                <button
                                    type="submit"
                                    disabled={mutation.isPending || rating === 0 || !comment.trim()}
                                    className="px-6 py-3 bg-primary-800 text-white rounded-full shadow-md hover:bg-primary-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {mutation.isPending ? t('submitting') : t('submitReview')}
                                </button>
                            </div>
                        </form>
                    </div>

                    {!user && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg">
                            <p className="text-lg font-medium text-gray-700 mb-4">{t('loginToReview')}</p>
                            <Link
                                href="/login"
                                className="px-6 py-3 bg-primary-800 text-white rounded-full shadow-md hover:bg-primary-700 transition-colors duration-300"
                            >
                                {t('loginNow')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}