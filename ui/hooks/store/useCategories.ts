import { GetAllCategories } from "@/domain/use-case/shop/getAllCategories";
import { langStore } from "@/lib/i18n/langStore";
import { useQuery } from "@tanstack/react-query";

export function useCategories() {
    return useQuery(
        {
            queryKey: ["categories", langStore.get()],
            queryFn: async () => await new GetAllCategories().execute(),

        }

    );
}