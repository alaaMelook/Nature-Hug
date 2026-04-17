import { cache } from "react";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";
import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";

/**
 * Cached helper to get admin staff permissions and role.
 * Uses React's cache() so multiple calls within the same request 
 * will only fetch once. This prevents redundant DB calls when 
 * both the layout and page need the same data.
 */
export const getAdminStaffPermissions = cache(async (): Promise<{
    customerId: number | null;
    permissions: string[];
    role: 'admin' | 'moderator' | 'staff' | null;
}> => {
    try {
        const user = await new GetCurrentUser().execute();
        if (!user) return { customerId: null, permissions: [], role: null };

        const repo = new ICustomerServerRepository();
        const memberRecord = await repo.fetchMember(user.id);
        if (!memberRecord) return { customerId: user.id, permissions: [], role: null };

        const permissions = await repo.getMemberPermissions(memberRecord.id);
        return {
            customerId: user.id,
            permissions,
            role: (memberRecord.role as 'admin' | 'moderator' | 'staff') || null
        };
    } catch {
        return { customerId: null, permissions: [], role: null };
    }
});
