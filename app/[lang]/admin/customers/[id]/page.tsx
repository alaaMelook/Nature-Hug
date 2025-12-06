import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";
import { CustomerProfileScreen } from "@/ui/client-screens/admin/customer-profile-screen";

import { revalidatePath } from "next/cache";

export default async function CustomerProfilePage({ params }: { params: { id: string } }) {
    const repo = new ICustomerServerRepository();
    const customerId = parseInt((await params).id);

    const customer = await repo.viewProfile(customerId);
    const orders = await repo.viewAllOrders(customerId);
    const member = await repo.fetchMember(customerId);

    const handlePromote = async (role: MemberRole) => {
        'use server';
        const repo = new ICustomerServerRepository();
        const member = await repo.fetchMember(customerId);

        if (member) {
            await repo.updateMember({
                user_id: customerId,
                role: role
            });
        } else {
            await repo.addMember({
                user_id: customerId,
                role: role
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
