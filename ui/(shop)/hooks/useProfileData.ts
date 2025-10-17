import { useQuery } from "@tanstack/react-query";
import { ViewProfile } from "@/domain/use-case/shop/viewProfile";

export function useProfileData(userId?: number) {
    return useQuery({
        queryKey: ["profile", userId],
        enabled: !!userId,
        queryFn: async () => {
            const viewProfile = new ViewProfile();
            return await viewProfile.execute(userId!);
        },
    });
}
