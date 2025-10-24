import { useQuery } from "@tanstack/react-query";
import { ViewProfile } from "@/domain/use-case/shop/viewProfile";

export function useProfileView(userId?: number) {
    return useQuery({
        queryKey: ["profile", userId],
        enabled: !!userId,
        queryFn: async () => await new ViewProfile().execute(userId!)
    });
}
