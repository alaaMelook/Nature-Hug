'use server'
import { UploadImage } from "@/domain/use-case/admin/images";
import { useMutation } from "@tanstack/react-query";


export async function useUploadImage(file: File) {
    let url = await new UploadImage().execute(file);
    return url;
}