'use server';

import { UploadImage, DeleteImage, GetAllImages } from "@/domain/use-case/admin/images";
import { revalidatePath } from "next/cache";

export async function uploadImageAction(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: "No file provided" };
        }

        const uploadImage = new UploadImage();
        const url = await uploadImage.execute(file);

        revalidatePath('/[lang]/admin/gallery', 'page');
        return { success: true, url };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteImageAction(imageName: string) {
    try {
        const deleteImage = new DeleteImage();
        await deleteImage.execute(imageName);

        revalidatePath('/[lang]/admin/gallery', 'page');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getImagesAction() {
    try {
        const refreshImages = new GetAllImages();
        const images = await refreshImages.execute();

        revalidatePath('/[lang]/admin/gallery', 'page');
        return { success: true, images: images };
    } catch (error: any) {
        return { success: false, error: error.message, images: [] };
    }
}

