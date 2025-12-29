import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";
import { CustomerProfileScreen } from "@/ui/client-screens/admin/customer-profile-screen";
import { EmployeePermissions } from "@/domain/entities/auth/permissions";

import { revalidatePath } from "next/cache";

export default async function CustomerProfilePage({ params }: { params: { id: string } }) {
    const repo = new ICustomerServerRepository();
    const customerId = parseInt((await params).id);

    const [customer, orders, member] = await Promise.all([
        repo.viewProfile(customerId),
        repo.viewAllOrders(customerId),
        repo.fetchMember(customerId)
    ]);

    const handlePromote = async (role: MemberRole, permissions?: EmployeePermissions) => {
        'use server';
        const repo = new ICustomerServerRepository();
        const member = await repo.fetchMember(customerId);

        if (member) {
            await repo.updateMember({
                user_id: customerId,
                role: role,
                permissions: permissions
            });
        } else {
            await repo.addMember({
                user_id: customerId,
                role: role,
                permissions: permissions || {}
            });
        }
        revalidatePath(`/admin/customers/${customerId}`);
    };

    const handleRevoke = async () => {
        'use server';
        const repo = new ICustomerServerRepository();
        await repo.removeMember(customerId);
        revalidatePath(`/admin/customers/${customerId}`);
    };

    return (
        <CustomerProfileScreen
            customer={customer}
            orders={orders}
            member={member}
            onPromote={handlePromote}
            onRevoke={handleRevoke}
        />
    );
}
