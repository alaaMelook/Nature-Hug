import { GetAllCategories } from "@/domain/use-case/shop/getAllCategories";
import { useQuery } from "@tanstack/react-query";

export function useCategories() {
    return useQuery(
        {
            queryKey: ["categories"],
            queryFn: () => new GetAllCategories().execute()
        }

    );
}