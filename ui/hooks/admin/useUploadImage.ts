'use server'
import { UploadImage } from "@/domain/use-case/admin/images";



export async function useUploadImage(file: File) {
    let url = await new UploadImage().execute(file);
    return url;
}