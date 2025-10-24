import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { UpdatePhoneUseCase } from "@/domain/use-case/shop/updatePhone";
// import { AddAddressUseCase } from "@/domain/use-case/shop/addAddress";
// import { DeleteAddressUseCase } from "@/domain/use-case/shop/deleteAddress";

export function useProfileActions(userId?: string) {
    const queryClient = useQueryClient();

    const updatePhone = useMutation({
        mutationFn: async (phone: string) => {
            // const useCase = new UpdatePhoneUseCase();
            // return await useCase.execute(userId!, phone);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", userId] }),
    });

    const addAddress = useMutation({
        mutationFn: async (address: string) => {
            // const useCase = new AddAddressUseCase();
            // return await useCase.execute(userId!, address);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", userId] }),
    });

    const deleteAddress = useMutation({
        mutationFn: async (addressId: number) => {
            // const useCase = new DeleteAddressUseCase();
            // return await useCase.execute(addressId);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", userId] }),
    });

    return { updatePhone, addAddress, deleteAddress };
}
