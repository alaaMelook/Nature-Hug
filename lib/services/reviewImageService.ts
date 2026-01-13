// Review Image Upload Service
// Handles uploading images to Supabase Storage for reviews

import { supabase } from "@/data/datasources/supabase/client";

const BUCKET_NAME = 'review-images';

interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * Upload a single image for a review
 */
export async function uploadReviewImage(file: File): Promise<UploadResult> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        console.log('[ReviewImageService] Uploading:', fileName);

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file, {
                contentType: file.type,
                upsert: false
            });

        if (error) {
            console.error('[ReviewImageService] Upload error:', error);
            return { success: false, error: error.message };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(data.path);

        console.log('[ReviewImageService] Upload success:', urlData.publicUrl);
        return { success: true, url: urlData.publicUrl };

    } catch (error: any) {
        console.error('[ReviewImageService] Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Upload multiple images for a review
 */
export async function uploadReviewImages(files: File[]): Promise<{ urls: string[]; errors: string[] }> {
    const urls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
        const result = await uploadReviewImage(file);
        if (result.success && result.url) {
            urls.push(result.url);
        } else {
            errors.push(result.error || 'Unknown error');
        }
    }

    return { urls, errors };
}

/**
 * Save review image URLs to database after review is created
 */
export async function saveReviewImages(reviewId: number, imageUrls: string[]): Promise<{ success: boolean; error?: string }> {
    if (imageUrls.length === 0) {
        return { success: true };
    }

    try {
        const inserts = imageUrls.map(url => ({
            review_id: reviewId,
            image_url: url
        }));

        const { error } = await supabase
            .schema('store')
            .from('review_images')
            .insert(inserts);

        if (error) {
            console.error('[ReviewImageService] Save error:', error);
            return { success: false, error: error.message };
        }

        console.log('[ReviewImageService] Saved', imageUrls.length, 'images for review', reviewId);
        return { success: true };

    } catch (error: any) {
        console.error('[ReviewImageService] Save error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get images for a specific review
 */
export async function getReviewImages(reviewId: number): Promise<string[]> {
    console.log('[ReviewImageService] Fetching images for review:', reviewId);
    try {
        const { data, error } = await supabase
            .schema('store')
            .from('review_images')
            .select('image_url')
            .eq('review_id', reviewId);

        console.log('[ReviewImageService] Query result:', { data, error, reviewId });

        if (error) {
            console.error('[ReviewImageService] Get images error:', error);
            return [];
        }

        const urls = data?.map(item => item.image_url) || [];
        console.log('[ReviewImageService] Returning URLs:', urls);
        return urls;

    } catch (error) {
        console.error('[ReviewImageService] Get images error:', error);
        return [];
    }
}

/**
 * Delete a single review image from storage and database
 */
export async function deleteReviewImage(reviewId: number, imageUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Extract the file name from the URL
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];

        console.log('[ReviewImageService] Deleting image:', fileName);

        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([fileName]);

        if (storageError) {
            console.error('[ReviewImageService] Storage delete error:', storageError);
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
            console.error('[ReviewImageService] DB delete error:', dbError);
            return { success: false, error: dbError.message };
        }

        console.log('[ReviewImageService] Successfully deleted image for review', reviewId);
        return { success: true };

    } catch (error: any) {
        console.error('[ReviewImageService] Delete error:', error);
        return { success: false, error: error.message };
    }
}
