import { ViewAllProducts } from "@/domain/use-case/shop/viewAllProducts";
import { ViewRecentProducts } from "@/domain/use-case/shop/viewRecentProducts";
import { langStore } from "@/lib/i18n/langStore";
import { useQuery } from "@tanstack/react-query";

export function useProductsData({ recent = false, count = 4 }: { recent?: boolean, count?: number }) {
    if (recent) {
        return useQuery({
            queryKey: ["recent-products", langStore.get()],
            queryFn: () => new ViewRecentProducts().execute(count),
        });
    }
    return useQuery({
        queryKey: ["products", langStore.get()],
        queryFn: () => new ViewAllProducts().execute(),
    });

}
