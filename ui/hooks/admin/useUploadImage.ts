import { UploadImage } from "@/domain/use-case/admin/uploadImage";
import { useMutation } from "@tanstack/react-query";


export function useUploadImage() {
    return useMutation({
        mutationKey: ["upload-image", Date.now()],
        mutationFn: async (file: File) =>
            await new UploadImage().execute(file)
    });
}