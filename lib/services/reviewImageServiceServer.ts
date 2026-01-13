// Server-side Review Image Service
// Handles saving review images to the database from server actions

import { createSupabaseServiceClient, createSupabaseServerClient } from "@/data/datasources/supabase/server";

/**
 * Save review image URLs to database after review is created (server-side)
 */
export async function saveReviewImagesServer(reviewId: number, imageUrls: string[]): Promise<{ success: boolean; error?: string }> {
    if (imageUrls.length === 0) {
        return { success: true };
    }

    try {
        const supabase = await createSupabaseServiceClient();

        const inserts = imageUrls.map(url => ({
            review_id: reviewId,
            image_url: url
        }));

        console.log('[ReviewImageService Server] Saving images:', inserts);

        const { error } = await supabase
            .schema('store')
            .from('review_images')
            .insert(inserts);

        if (error) {
            console.error('[ReviewImageService Server] Save error:', error);
            return { success: false, error: error.message };
        }

        console.log('[ReviewImageService Server] Saved', imageUrls.length, 'images for review', reviewId);
        return { success: true };

    } catch (error: any) {
        console.error('[ReviewImageService Server] Save error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get images for a specific review (server-side)
 */
export async function getReviewImagesServer(reviewId: number): Promise<string[]> {
    try {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .schema('store')
            .from('review_images')
            .select('image_url')
            .eq('review_id', reviewId);

        if (error) {
            console.error('[ReviewImageService Server] Get images error:', error);
            return [];
        }

        return data?.map(item => item.image_url) || [];

    } catch (error) {
        console.error('[ReviewImageService Server] Get images error:', error);
        return [];
    }
}

/**
 * Delete a single review image from storage and database (server-side)
 */
export async function deleteReviewImageServer(reviewId: number, imageUrl: string): Promise<{ success: boolean; error?: string }> {
    const BUCKET_NAME = 'review-images';

    try {
        const supabase = await createSupabaseServerClient();

        // Extract the file name from the URL
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];

        console.log('[ReviewImageService Server] Deleting image:', fileName);

        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([fileName]);

        if (storageError) {
            console.error('[ReviewImageService Server] Storage delete error:', storageError);
            // Continue to delete from database even if storage fails
        }

        // Delete from database
        const { error: dbError } = await supabase
            .schema('store')
            .from('review_images')
            .delete()
            .eq('review_id', reviewId)
            .eq('image_url', imageUrl);

        if (dbError) {
            console.error('[ReviewImageService Server] DB delete error:', dbError);
            return { success: false, error: dbError.message };
        }

        console.log('[ReviewImageService Server] Successfully deleted image for review', reviewId);
        return { success: true };

    } catch (error: any) {
        console.error('[ReviewImageService Server] Delete error:', error);
        return { success: false, error: error.message };
    }
}
