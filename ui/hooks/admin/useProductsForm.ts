import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AddProduct, UpdateProduct } from "@/domain/use-case/admin/products";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";



export function useProductForm(onSaved?: () => void) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<Partial<ProductAdminView> | null>({});
    const [imageFile, setImageFile] = useState<File | null>(null);

    const createMutation = useMutation({
        mutationFn: async (data: Partial<ProductAdminView>) => await new AddProduct().execute(data as ProductAdminView),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            onSaved?.();
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: Partial<ProductAdminView>) => await new UpdateProduct().execute(data as ProductAdminView),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            onSaved?.();
        },
    });

    const saveProduct = (isEdit: boolean) => {
        const payload = { ...formData, imageFile };
        if (isEdit) updateMutation.mutate(payload);
        else createMutation.mutate(payload);
    };

    return {
        formData,
        setFormData,
        setImageFile,
        saveProduct,
        saving: createMutation.isPending || updateMutation.isPending,
    };
}
