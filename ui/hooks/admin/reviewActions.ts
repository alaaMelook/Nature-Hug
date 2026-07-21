'use server';

import { UpdateReviewStatus } from "@/domain/use-case/admin/updateReviewStatus";
import { CreateReview } from "@/domain/use-case/admin/createReview";
import { DeleteReview } from "@/domain/use-case/admin/deleteReview";
import { deleteReviewImageServer } from "@/lib/services/reviewImageServiceServer";
import { revalidatePath } from "next/cache";

export async function updateReviewStatusAction(reviewId: number, status: 'approved' | 'rejected' | 'pending') {
    try {
        await new UpdateReviewStatus().execute(reviewId, status);
        revalidatePath('/[lang]/admin/products/reviews', 'page');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error("Failed to update review status:", error);
        return { success: false, error: "Failed to update review status" };
    }
}

export async function deleteReviewImageAction(reviewId: number, imageUrl: string) {
    try {
        const result = await deleteReviewImageServer(reviewId, imageUrl);
        if (result.success) {
            revalidatePath('/[lang]/admin/products/reviews', 'page');
            revalidatePath('/', 'layout');
        }
        return result;
    } catch (error) {
        console.error("Failed to delete review image:", error);
        return { success: false, error: "Failed to delete review image" };
    }
}

export async function createReviewAction(review: {
    product_id: number;
    customer_name: string;
    rating: number;
    comment?: string;
    status: string;
}) {
    try {
        await new CreateReview().execute(review);
        revalidatePath('/[lang]/admin/products/reviews', 'page');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to create review:", error);
        return { success: false, error: error?.message || "Failed to create review" };
    }
}

export async function deleteReviewAction(reviewId: number) {
    try {
        await new DeleteReview().execute(reviewId);
        revalidatePath('/[lang]/admin/products/reviews', 'page');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete review:", error);
        return { success: false, error: error?.message || "Failed to delete review" };
    }
}
