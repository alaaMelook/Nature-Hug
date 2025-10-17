import { ViewProduct } from "@/domain/use-case/shop/viewProduct";
import { langStore } from "@/lib/i18n/langStore";
import { useQuery } from "@tanstack/react-query";

export function useProductDetailData(slug: string) {
    return useQuery({
        queryKey: ["product-detail", slug, langStore.get()], // include language to auto-refetch
        queryFn: () => new ViewProduct().execute(slug),

    });
}