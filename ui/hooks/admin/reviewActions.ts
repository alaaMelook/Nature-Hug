'use server';

import { UpdateReviewStatus } from "@/domain/use-case/admin/updateReviewStatus";
import { deleteReviewImageServer } from "@/lib/services/reviewImageServiceServer";
import { revalidatePath } from "next/cache";

export async function updateReviewStatusAction(reviewId: number, status: 'approved' | 'rejected' | 'pending') {
    try {
        await new UpdateReviewStatus().execute(reviewId, status);
        revalidatePath('/[lang]/admin/products/reviews', 'page');
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
        }
        return result;
    } catch (error) {
        console.error("Failed to delete review image:", error);
        return { success: false, error: "Failed to delete review image" };
    }
}
