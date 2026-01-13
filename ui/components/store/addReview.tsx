'use client'

import React, { useState, useRef } from 'react'
import { ChevronDown, ChevronUp, Star, ImagePlus, X, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ProductDetailView } from '@/domain/entities/views/shop/productDetailView'
import Link from 'next/link'
import { useSupabase } from "@/ui/hooks/useSupabase";
import { postReview } from "@/ui/hooks/store/useAddReview";
import { uploadReviewImages } from "@/lib/services/reviewImageService";
import Image from 'next/image'


export function AddReview({ product }: { product: ProductDetailView }) {

    const { t } = useTranslation()
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [hoverRating, setHoverRating] = useState(0)
    const [isExpanded, setIsExpanded] = useState(false)
    const { user } = useSupabase();

    // Image upload state
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Add new files to existing
        const newImages = [...selectedImages, ...files];
        setSelectedImages(newImages);

        // Create previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    // Remove an image
    const removeImage = (index: number) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);

        // Clean up the URL object
        URL.revokeObjectURL(imagePreviews[index]);

        setSelectedImages(newImages);
        setImagePreviews(newPreviews);
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        try {
            // Upload images first if any
            let imageUrls: string[] = [];
            if (selectedImages.length > 0) {
                setUploadingImages(true);
                const uploadResult = await uploadReviewImages(selectedImages);
                imageUrls = uploadResult.urls;

                if (uploadResult.errors.length > 0) {
                    console.warn("[AddReview] Some images failed to upload:", uploadResult.errors);
                    toast.warning(t('someImagesFailed') || 'بعض الصور فشلت في الرفع');
                }
                setUploadingImages(false);
            }

            const data = {
                product: product.product_id,
                rating: rating,
                comment: comment,
                imageUrls: imageUrls,
            };

            console.log('[AddReview] Sending to postReview:', JSON.stringify(data, null, 2));
            console.log('[AddReview] imageUrls array:', imageUrls);
            console.log('[AddReview] imageUrls length:', imageUrls.length);

            const result = await postReview(data);

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success(t('reviewAddedSuccessfully'))
                setRating(0);
                setComment('');
                setSelectedImages([]);
                setImagePreviews([]);
                setIsExpanded(false);
            }
        } catch (error) {
            console.error("[AddReview] Error:", error);
            toast.error(t('errorAddingReview') || 'حدث خطأ أثناء إضافة التقييم');
        } finally {
            setLoading(false);
            setUploadingImages(false);
        }
    }


    const handleStarClick = (index: number) => {
        setRating(index + 1)
    }


    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="my-5 mx-auto w-full md:w-1/2">
            {/* The Expand/Collapse Button */}
            <button
                onClick={toggleExpansion}
                className="w-full flex items-center justify-center gap-5 px-6 py-4 bg-primary-800 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-primary-300"
            >
                <span className="text-sm sm:text-lg md:text-xl font-semibold text-center">{t('addYourReview')}</span>
                {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>

            {/* The Review Form Content */}
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] pt-6' : 'max-h-0'}`}>
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

                            {/* Rating Stars */}
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

                            {/* Comment */}
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

                            {/* Image Upload Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('addImages') || 'أضف صور (اختياري)'}
                                </label>

                                {/* Image Previews */}
                                {imagePreviews.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mb-3">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <Image
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    width={80}
                                                    height={80}
                                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Image Button */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-primary-300 rounded-lg text-primary-700 hover:bg-primary-50 transition-colors"
                                >
                                    <ImagePlus size={20} />
                                    <span>{t('selectImages') || 'اختر صور'}</span>
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="text-right">
                                <button
                                    type="submit"
                                    disabled={loading || rating === 0 || !comment.trim()}
                                    className="px-6 py-3 bg-primary-800 text-white rounded-full shadow-md hover:bg-primary-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
                                >
                                    {loading && <Loader2 size={18} className="animate-spin" />}
                                    {uploadingImages ? (t('uploadingImages') || 'جاري رفع الصور...') :
                                        loading ? t('submitting') : t('submitReview')}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Login Overlay */}
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