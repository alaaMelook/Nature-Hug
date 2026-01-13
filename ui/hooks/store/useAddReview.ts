'use server'

import { revalidatePath } from 'next/cache'
import { Review } from "@/domain/entities/database/review";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";
import { AddProductReview } from "@/domain/use-case/store/addProductReview";
import { saveReviewImagesServer } from "@/lib/services/reviewImageServiceServer";



export async function postReview(data: {
    product: number;
    rating: number;
    comment: string;
    imageUrls?: string[];  // Optional array of uploaded image URLs
}) {
    console.log("[postReview] ========== SERVER ACTION CALLED ==========");
    console.log("[postReview] Received data:", JSON.stringify(data, null, 2));
    console.log("[postReview] imageUrls:", data.imageUrls);

    const user = await new GetCurrentUser().execute();
    if (!user) return { error: 'User not logged in' };


    const review: Partial<Review> = {
        product_id: data['product'],
        customer_id: user.id,
        rating: data['rating'],
        comment: data['comment'],
    };
    if (!review.product_id) return { error: 'Product not found' };

    try {
        // Create the review and get its ID
        const reviewId = await new AddProductReview().execute(review);
        console.log("[postReview] Review created with ID:", reviewId);

        // Save images if any were uploaded
        if (data.imageUrls && data.imageUrls.length > 0) {
            console.log("[postReview] Saving", data.imageUrls.length, "images for review", reviewId);
            const result = await saveReviewImagesServer(reviewId, data.imageUrls);
            if (!result.success) {
                console.error("[postReview] Failed to save images:", result.error);
                // Don't fail the whole review, just log the error
            }
        }

        revalidatePath('/', 'layout');
        return { success: true, reviewId };
    } catch (error) {
        console.error("[postReview] Error:", error);
        return { error: 'Failed to post review' };
    }
}

export async function updateReview(data: {
    reviewId: number;
    rating: number;
    comment: string;
}) {
    console.log("[updateReview] ========== SERVER ACTION CALLED ==========");
    console.log("[updateReview] Received data:", JSON.stringify(data, null, 2));

    const user = await new GetCurrentUser().execute();
    if (!user) return { error: 'User not logged in' };

    try {
        const { IProductServerRepository } = await import("@/data/repositories/server/iProductsRepository");
        const repo = new IProductServerRepository();

        const success = await repo.updateReview(data.reviewId, user.id, {
            rating: data.rating,
            comment: data.comment,
        });

        if (!success) {
            return { error: 'Review not found or not authorized' };
        }

        console.log("[updateReview] Review updated successfully");
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error("[updateReview] Error:", error);
        return { error: 'Failed to update review' };
    }
}
