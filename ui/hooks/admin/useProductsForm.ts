// import {useState} from "react";
// import {useMutation, useQueryClient} from "@tanstack/react-query";
// import {AddProduct, UpdateProduct} from "@/domain/use-case/admin/products";
// import {ProductAdminView} from "@/domain/entities/views/admin/productAdminView";


// export function useProductForm(onSaved?: () => void) {
//     const queryClient = useQueryClient();
//     const [formData, setFormData] = useState<Partial<ProductAdminView> | null>({});
//     const [imageFile, setImageFile] = useState<File | null>(null);

//     const createMutation = useMutation({
//         mutationFn: async (data: Partial<ProductAdminView>) => await new AddProduct().execute(data as ProductAdminView),
//         onSuccess: async () => {
//             await queryClient.invalidateQueries({queryKey: ["products"]});
//             onSaved?.();
//         },
//     });

//     const updateMutation = useMutation({
//         mutationFn: async (data: Partial<ProductAdminView>) => await new UpdateProduct().execute(data as ProductAdminView),
//         onSuccess: async () => {
//             await queryClient.invalidateQueries({queryKey: ["products"]});
//             onSaved?.();
//         },
//     });

//     const saveProduct = (isEdit: boolean) => {
//         console.log('[SAVING PRODUCTS] is editing? ', isEdit);
//         const payload = {...formData, imageFile};
//         console.log('[SAVING PRODUCTS] payload: ', payload);
//         if (isEdit) {
//             console.log('[SAVING PRODUCTS] start edit');
//             updateMutation.mutate(payload);

//         } else {
//             console.log('[SAVING PRODUCTS] start create');
//             createMutation.mutate(payload);
//             if (createMutation.error)
//                 console.log('[SAVING PRODUCTS] Error:', createMutation.error)
//             if (createMutation.isSuccess)
//                 console.log('[SAVING PRODUCTS] Success')

//         }
//     };

//     return {
//         formData,
//         setFormData,
//         setImageFile,
//         saveProduct,
//         saving: createMutation.isPending || updateMutation.isPending,
//     };
// }
