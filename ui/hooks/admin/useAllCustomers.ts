import { GetAllCustomers } from "@/domain/use-case/admin/getAllCustomers";
import { langStore } from "@/lib/i18n/langStore";
import { useQuery } from "@tanstack/react-query";

export function useAllCustomers({ withoutMembers = false }: { withoutMembers?: boolean }) {
    return useQuery({
        queryKey: ["allCustomers", langStore.get(), withoutMembers],
        queryFn: async () => await new GetAllCustomers().execute({ withoutMembers }),
    });
}
