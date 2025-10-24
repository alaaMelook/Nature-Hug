import { Login } from "@/domain/use-case/shipments/login";
import { useQuery } from "@tanstack/react-query";

export function useLoginAction() {
    return useQuery({
        queryKey: ["admin-login"],
        queryFn: async () => await new Login().execute(),
        staleTime: 1000 * 60 * 10,
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchInterval: false,
        retryOnMount: false,


    });

}
