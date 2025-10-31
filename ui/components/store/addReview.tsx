'use client'

import React, {useEffect, useState} from 'react'
import {ChevronDown, ChevronUp, Star} from 'lucide-react' // Import icons for expansion
import {useTranslation} from '@/ui/providers/TranslationProvider'
import {toast} from 'sonner'
import {ProductDetailView} from '@/domain/entities/views/shop/productDetailView'
import Link from 'next/link'
import {useSupabase} from "@/ui/hooks/useSupabase";
import {Customer} from "@/domain/entities/auth/customer";
import {postReview} from "@/ui/hooks/store/useAddReview";


export function AddReview({product}: { product: ProductDetailView }) {

    const {t} = useTranslation()
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [hoverRating, setHoverRating] = useState(0)
    const [isExpanded, setIsExpanded] = useState(false) // New state for expand/collapse
    const {getUser} = useSupabase();
    const [user, setUser] = useState<Customer | undefined>();

    useEffect(() => {
        getUser().then((result) => {
                setUser(result);
            }
        )
    }, []);


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const data = {
            product: product.product_id,
            rating: rating,
            comment: comment,
        };

        const result = await postReview(data); // send plain object

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success(t('reviewAddedSuccessfully'))
            setRating(0)
            setComment('')
            setIsExpanded(false); // Collapse the form after successful submission
        }
        setLoading(false)
    }


    const handleStarClick = (index: number) => {
        setRating(index + 1)
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
                {isExpanded ? <ChevronUp size={24}/> : <ChevronDown size={24}/>}
            </button>

            {/* The Review Form Content, shown only when isExpanded is true */}
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-screen pt-6' : 'max-h-0'}`}>
                <div
                    className={`relative ${!user ? 'bg-gray-300' : "bg-white"} p-6 rounded-lg shadow-md border border-gray-100`}>

                    <div className={`${!user ? 'filter blur-sm' : ''}`}>
                        <h3 className="text-2xl font-bold text-primary-800 mb-4">{t('addYourReview')}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                name='product'
                                value={product.product_id}
                                hidden={true}
                                readOnly={true}
                            />
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                                    name='comment'
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder={t('writeYourReviewHere')}
                                />
                                <input
                                    name='rating'
                                    type={'number'}
                                    hidden={true}
                                    value={rating}
                                    readOnly={true}
                                />
                            </div>
                            <div className="text-right">


                                <button
                                    type="submit"
                                    disabled={loading || rating === 0 || !comment.trim()}
                                    className="px-6 py-3 bg-primary-800 text-white rounded-full shadow-md hover:bg-primary-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {loading ? t('submitting') : t('submitReview')}
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