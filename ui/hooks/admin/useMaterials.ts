import { useQuery } from "@tanstack/react-query";
import { GetAllMaterials } from "@/domain/use-case/admin/materials";

export function useMaterials() {
    return useQuery({
        queryKey: ["materials"],
        queryFn: async () => await new GetAllMaterials().execute(),
    });


}
