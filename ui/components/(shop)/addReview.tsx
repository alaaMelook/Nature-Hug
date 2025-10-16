'use client'

import React, { useState } from 'react'
import { Link, Star } from 'lucide-react'
import { useTranslation } from '@/providers/TranslationProvider'
import { useSupabaseAuth } from '@/providers/SupabaseAuthProvider'
import { toast } from 'sonner'
import { addProductReview } from '@/domain/use-case/shop/addProductReview'
import { ProductDetailView } from '@/domain/entities/views/shop/productDetailView'
import { ProductView } from '@/domain/entities/views/shop/productView'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Review } from '@/domain/entities/database/review'
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
    const [isSubmitting, setIsSubmitting] = useState(false)
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: addProductReview,
        onSuccess: () => {
            toast.success(t('reviewAddedSuccessfully'))
            setRating(0)
            setComment('')
            onReviewAdded()
            queryClient.invalidateQueries({ queryKey: ["reviews", product.slug] });
        },
        onError: (error) => {
            console.error('Failed to add review:', error)
            toast.error(t('failedToAddReview'))
        }
    });
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
        const review = {
            id: 0,
            product_id: product.id,
            customer_id: user.id,
            rating: rating,
            comment: comment,
            status: 'pending',
            created_at: ''
        };

        setIsSubmitting(true)
        try {
            // const { error } = useQuery({
            //     queryKey: ["review", product.slug, user.id], // include language to auto-refetch
            //     queryFn: () => addProductReview(review),
            // });
            // if (error) {
            //     throw error
            // }
            mutation.mutate(review)
            // toast.success(t('reviewAddedSuccessfully'))
            // setRating(0)
            // setComment('')
            // onReviewAdded()
        } catch (error) {
            console.error('Failed to add review:', error)
            toast.error(t('failedToAddReview'))
        } finally {
            setIsSubmitting(false)
        }
    }

    if (authLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <p>{t('loading')}...</p>
            </div>
        )
    }

    // if (!user) {
    //     return (
    //         <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg shadow-inner">
    //             <p className="text-lg font-medium text-gray-700 mb-4">{t('loginToReview')}</p>
    //             <Link
    //                 href="/login"
    //                 className="px-6 py-3 bg-primary-800 text-white rounded-full shadow-md hover:bg-primary-700 transition-colors duration-300"
    //             >
    //                 {t('loginNow')}
    //             </Link>
    //         </div>
    //     )
    // }
    /**
     'use client'
    
    import React, { useState } from 'react'
    import { Star } from 'lucide-react'
    import { useTranslation } from '@/providers/TranslationProvider'
    import { useSupabaseAuth } from '@/providers/SupabaseAuthProvider'
    import { toast } from 'sonner'
    import { addProductReview } from '@/domain/use-case/shop/addProductReview'
    import { ProductDetailView } from '@/domain/entities/views/shop/productDetailView'
    import { ProductView } from '@/domain/entities/views/shop/productView'
    import { useMutation, useQueryClient } from "@tanstack/react-query";
    import Link from 'next/link';
    
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
        const queryClient = useQueryClient();
    
        const mutation = useMutation({
            mutationFn: addProductReview,
            onSuccess: () => {
                toast.success(t('reviewAddedSuccessfully'))
                setRating(0)
                setComment('')
                onReviewAdded()
                queryClient.invalidateQueries({ queryKey: ["reviews", product.slug] });
            },
            onError: (error) => {
                console.error('Failed to add review:', error)
                toast.error(t('failedToAddReview'))
            }
        });
    
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
            const review = {
                id: 0,
                product_id: product.id,
                customer_id: user.id as any,
                rating: rating,
                comment: comment,
                status: "pending" as const,
                created_at: new Date().toISOString(),
            }
    
            mutation.mutate(review);
        }
    
        if (authLoading) {
            return (
                <div className="flex justify-center items-center py-8">
                    <p>{t('loading')}...</p>
                </div>
            )
        }
    
        return (
            <div className="relative bg-white p-6 rounded-lg shadow-md border border-gray-100">
                {!user && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white bg-opacity-90 rounded-lg">
                        <p className="text-lg font-medium text-gray-700 mb-4">{t('loginToReview')}</p>
                        <Link
                            href="/login"
                            className="px-6 py-3 bg-primary-800 text-white rounded-full shadow-md hover:bg-primary-700 transition-colors duration-300"
                        >
                            {t('loginNow')}
                        </Link>
                    </div>
                )}
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
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
            </div>
        )
    }
    
     */

    return (
        <div className="relative bg-white p-6 my-10 mx-40 rounded-lg shadow-md border border-gray-100 w-1/2">
            {!user && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white bg-opacity-90 rounded-lg">
                    <p className="text-lg font-medium text-gray-700 mb-4">{t('loginToReview')}</p>
                    <Link
                        href="/login"
                        className="px-6 py-3 bg-primary-800 text-white rounded-full shadow-md hover:bg-primary-700 transition-colors duration-300"
                    >
                        {t('loginNow')}
                    </Link>
                </div>
            )}
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
        </div>
    );
}